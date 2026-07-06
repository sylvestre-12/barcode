import { supabase } from './supabase'

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

export async function getAdminKpis() {
  const today = todayDate()

  const { count: totalMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  const { data: todayRecords } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('date', today)

  const presentToday = todayRecords?.length ?? 0
  const lateToday = todayRecords?.filter((r) => r.status === 'late').length ?? 0
  const absentToday = Math.max((totalMembers ?? 0) - presentToday, 0)

  return {
    totalMembers: totalMembers ?? 0,
    presentToday,
    absentToday,
    lateToday,
  }
}

export async function getWeeklyTrend() {
  const days: { date: string; label: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
    })
  }

  const startDate = days[0].date
  const { data: records } = await supabase
    .from('attendance_records')
    .select('date, status')
    .gte('date', startDate)

  return days.map(({ date, label }) => {
    const dayRecords = records?.filter((r) => r.date === date) ?? []
    return {
      day: label,
      present: dayRecords.filter((r) => r.status !== 'late').length,
      late: dayRecords.filter((r) => r.status === 'late').length,
    }
  })
}

export async function getSupervisorStatus(barcode: string | null) {
  if (!barcode) return null

  const today = todayDate()
  const { data: todayRecord } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('barcode', barcode)
    .eq('date', today)
    .order('check_in', { ascending: false })
    .limit(1)
    .maybeSingle()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentRecords } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('barcode', barcode)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  const daysPresent = recentRecords?.length ?? 0
  const onTimeCount = recentRecords?.filter((r) => r.status !== 'late').length ?? 0
  const onTimeRate = daysPresent > 0 ? Math.round((onTimeCount / daysPresent) * 100) : 0

  const withDuration = recentRecords?.filter((r) => r.duration_minutes != null) ?? []
  const avgMinutes =
    withDuration.length > 0
      ? Math.round(withDuration.reduce((sum, r) => sum + (r.duration_minutes ?? 0), 0) / withDuration.length)
      : 0

  return {
    todayRecord,
    daysPresent,
    onTimeRate,
    avgHours: (avgMinutes / 60).toFixed(1),
    recentRecords: recentRecords?.slice(0, 10) ?? [],
  }
}

export async function getStaffTeamSummary() {
  const today = todayDate()

  const { data: members } = await supabase.from('members').select('*')
  const { data: todayRecords } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('date', today)

  const presentBarcodes = new Set(todayRecords?.map((r) => r.barcode) ?? [])
  const lateRecords = todayRecords?.filter((r) => r.status === 'late') ?? []

  const absentMembers = (members ?? []).filter((m) => !presentBarcodes.has(m.barcode))

  return {
    totalMembers: members?.length ?? 0,
    presentToday: presentBarcodes.size,
    absentToday: absentMembers.length,
    lateToday: lateRecords.length,
    lateMembers: lateRecords.map((r) => ({ name: r.member_name, time: r.check_in })),
    absentMembers: absentMembers.map((m) => m.name),
  }
}