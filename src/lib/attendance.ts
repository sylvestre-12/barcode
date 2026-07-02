import { supabase } from './supabase'
import type { Member, AttendanceRecord } from '@/types/member'
import { logAction } from './audit'
import { getCheckinCutoffHour } from './settings'

export function isLateArrival(checkInISO: string): boolean {
  const time = new Date(checkInISO)
  return time.getHours() > 9 || (time.getHours() === 9 && time.getMinutes() > 0)
}

export function isEarlyDeparture(checkOutISO: string): boolean {
  const time = new Date(checkOutISO)
  return time.getHours() < 17
}

export function calculateDuration(checkIn: string, checkOut: string): number {
  return Math.floor((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000)
}

export function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr).getDay()
  return day === 0 || day === 6
}

export function formatStatusLabel(status: string): string {
  const map: Record<string, string> = {
    'checked-in': 'Checked In',
    'checked-out': 'Checked Out',
    'late': 'Late',
    'early-departure': 'Early Departure',
    'overtime': 'Overtime',
    'absent': 'Absent',
  }
  return map[status] ?? status
}

export interface ScanResult {
  success: boolean
  error?: string
  member?: Member
  record?: AttendanceRecord
  eventType?: 'check-in' | 'check-out'
  isOvertime?: boolean
  isLate?: boolean
  isEarlyDeparture?: boolean
  isBuddyPunch?: boolean
}

const lastScanTimes = new Map<string, number>()

export async function processScan(barcode: string, operatorId: string, operatorName: string): Promise<ScanResult> {
  const trimmedBarcode = barcode.trim()

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('barcode', trimmedBarcode)
    .single()

  if (memberError || !member) {
    return { success: false, error: 'Barcode not found. This member does not exist in the system.' }
  }

  if (!member.barcode_active) {
    return { success: false, error: 'Barcode Inactive', member }
  }

  if (member.barcode_expires_at) {
    const expiryDate = new Date(member.barcode_expires_at)
    if (expiryDate < new Date()) {
      return {
        success: false,
        error: `Barcode Expired (expired ${member.barcode_expires_at})`,
        member,
      }
    }
  }

  const now = Date.now()
  const lastScan = lastScanTimes.get(trimmedBarcode)
  const isBuddyPunch = lastScan ? (now - lastScan) < 2 * 60 * 1000 : false
  lastScanTimes.set(trimmedBarcode, now)

  const today = new Date().toISOString().split('T')[0]
  const { data: openRecord } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('member_id', member.id)
    .eq('date', today)
    .is('check_out', null)
    .order('check_in', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nowISO = new Date().toISOString()

  if (!openRecord) {
    // CHECK-IN
    const cutoffHour = await getCheckinCutoffHour()
    if (cutoffHour !== null) {
      const currentHour = new Date(nowISO).getHours()
      if (currentHour >= cutoffHour) {
        return {
          success: false,
          error: `Check-in is not allowed after ${cutoffHour}:00. Please contact an administrator.`,
          member,
        }
      }
    }

    const late = isLateArrival(nowISO)
    const { data: newRecord, error: insertError } = await supabase
      .from('attendance_records')
      .insert({
        member_id: member.id,
        member_name: member.name,
        barcode: trimmedBarcode,
        check_in: nowISO,
        date: today,
        status: late ? 'late' : 'checked-in',
        scanned_by: operatorId,
        scanned_by_name: operatorName,
      })
      .select()
      .single()

    if (insertError) {
      return { success: false, error: 'Failed to save check-in. Please try again.', member }
    }

    await logAction({ actorId: operatorId, actorName: operatorName, action: 'CHECK_IN', targetType: 'attendance_record', targetId: newRecord.id, newValue: { barcode: trimmedBarcode, time: nowISO } })

    await supabase.from('notifications').insert({
      type: late ? 'late-arrival' : 'check-in',
      title: late ? 'Late Arrival' : 'Check-In',
      message: `${member.name} checked in at ${new Date(nowISO).toLocaleTimeString()}${late ? ' (late)' : ''}`,
      severity: late ? 'warning' : 'info',
    })

    return {
      success: true,
      member,
      record: newRecord,
      eventType: 'check-in',
      isLate: late,
      isBuddyPunch,
    }
  } else {
    // CHECK-OUT (no cutoff applies here)
    const duration = calculateDuration(openRecord.check_in, nowISO)
    const early = isEarlyDeparture(nowISO)
    const overtime = duration > 480

    const { data: updatedRecord, error: updateError } = await supabase
      .from('attendance_records')
      .update({
        check_out: nowISO,
        duration_minutes: duration,
        status: early ? 'early-departure' : (overtime ? 'overtime' : 'checked-out'),
        is_overtime: overtime,
      })
      .eq('id', openRecord.id)
      .select()
      .single()

    if (updateError) {
      return { success: false, error: 'Failed to save check-out. Please try again.', member }
    }

    await logAction({ actorId: operatorId, actorName: operatorName, action: 'CHECK_OUT', targetType: 'attendance_record', targetId: updatedRecord.id, newValue: { barcode: trimmedBarcode, duration } })

    await supabase.from('notifications').insert({
      type: 'check-out',
      title: 'Check-Out',
      message: `${member.name} checked out at ${new Date(nowISO).toLocaleTimeString()} (${duration} min)`,
      severity: 'info',
    })

    return {
      success: true,
      member,
      record: updatedRecord,
      eventType: 'check-out',
      isOvertime: overtime,
      isEarlyDeparture: early,
      isBuddyPunch,
    }
  }
}