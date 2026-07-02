import { supabase } from './supabase'

export interface MemberPattern {
  barcode: string
  name: string
  avgCheckIn: string
  avgCheckOut: string
  avgDurationMinutes: number
  totalDays: number
  lateDays: number
  attendanceRate: number
}

export async function getAttendancePatterns(): Promise<MemberPattern[]> {
  const { data: members } = await supabase.from('members').select('id, name, barcode')
  const { data: records } = await supabase.from('attendance_records').select('*')

  if (!members || !records) return []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const totalPossibleDays = 30

  return members.map((m) => {
    const memberRecords = records.filter((r) => r.barcode === m.barcode)
    const totalDays = memberRecords.length
    const lateDays = memberRecords.filter((r) => r.status === 'late').length

    const checkInMinutes = memberRecords.map((r) => {
      const d = new Date(r.check_in)
      return d.getHours() * 60 + d.getMinutes()
    })
    const checkOutMinutes = memberRecords
      .filter((r) => r.check_out)
      .map((r) => {
        const d = new Date(r.check_out!)
        return d.getHours() * 60 + d.getMinutes()
      })
    const durations = memberRecords.filter((r) => r.duration_minutes != null).map((r) => r.duration_minutes!)

    const avg = (arr: number[]) => (arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0)
    const minutesToTime = (mins: number) => {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }

    return {
      barcode: m.barcode,
      name: m.name,
      avgCheckIn: checkInMinutes.length > 0 ? minutesToTime(avg(checkInMinutes)) : '—',
      avgCheckOut: checkOutMinutes.length > 0 ? minutesToTime(avg(checkOutMinutes)) : '—',
      avgDurationMinutes: avg(durations),
      totalDays,
      lateDays,
      attendanceRate: Math.min(Math.round((totalDays / totalPossibleDays) * 100), 100),
    }
  })
}

export async function getWeeklyDayOfWeekTrend() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: records } = await supabase
    .from('attendance_records')
    .select('date, status')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const buckets = dayLabels.map((label, idx) => {
    const dayRecords = (records ?? []).filter((r) => new Date(r.date).getDay() === idx)
    return {
      day: label,
      present: dayRecords.filter((r) => r.status !== 'late').length,
      late: dayRecords.filter((r) => r.status === 'late').length,
      total: dayRecords.length,
    }
  })

  // Reorder to start Monday
  return [...buckets.slice(1), buckets[0]]
}

export interface AnomalyRow {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high'
  member_name: string
  date: string
  description: string
  dismissed: boolean
}

export async function getAnomalies(): Promise<AnomalyRow[]> {
  const { data } = await supabase
    .from('anomalies')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function dismissAnomaly(id: string, userId: string) {
  await supabase
    .from('anomalies')
    .update({ dismissed: true, dismissed_by: userId, dismissed_at: new Date().toISOString() })
    .eq('id', id)
}

// Run this to populate anomalies table from current attendance_records
export async function detectAndInsertAnomalies() {
  const { data: records } = await supabase.from('attendance_records').select('*')
  if (!records) return

  const { data: members } = await supabase.from('members').select('id, barcode, name')
  const memberMap = new Map((members ?? []).map((m) => [m.barcode, m]))

  const { data: existingAnomalies } = await supabase.from('anomalies').select('member_id, type, date')
  const existingKeys = new Set((existingAnomalies ?? []).map((a) => `${a.member_id}-${a.type}-${a.date}`))

  const newAnomalies: any[] = []

  for (const r of records) {
    const member = memberMap.get(r.barcode)
    if (!member) continue

    const day = new Date(r.date).getDay()
    if ((day === 0 || day === 6) && !existingKeys.has(`${member.id}-weekend-access-${r.date}`)) {
      newAnomalies.push({
        member_id: member.id,
        member_name: member.name,
        type: 'weekend-access',
        severity: 'low',
        date: r.date,
        description: 'Activity recorded on a weekend',
      })
    }

    if (r.status === 'late' && !existingKeys.has(`${member.id}-late-arrival-${r.date}`)) {
      const hour = new Date(r.check_in).getHours()
      newAnomalies.push({
        member_id: member.id,
        member_name: member.name,
        type: 'late-arrival',
        severity: hour >= 11 ? 'high' : 'medium',
        date: r.date,
        description: `Late check-in at ${new Date(r.check_in).toLocaleTimeString()}`,
      })
    }

    if (r.duration_minutes != null && !existingKeys.has(`${member.id}-unusual-duration-${r.date}`)) {
      if (r.duration_minutes < 240) {
        newAnomalies.push({
          member_id: member.id,
          member_name: member.name,
          type: 'unusual-duration',
          severity: 'medium',
          date: r.date,
          description: `Very short session: ${r.duration_minutes} minutes`,
        })
      } else if (r.duration_minutes > 720) {
        newAnomalies.push({
          member_id: member.id,
          member_name: member.name,
          type: 'unusual-duration',
          severity: 'high',
          date: r.date,
          description: `Unusually long session: ${r.duration_minutes} minutes`,
        })
      }
    }
  }

  if (newAnomalies.length > 0) {
    await supabase.from('anomalies').insert(newAnomalies)
  }

  return newAnomalies.length
}