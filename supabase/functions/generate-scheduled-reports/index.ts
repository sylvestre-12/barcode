import { createClient } from '@supabase/supabase-js'

interface AttendanceRecord {
  date: string
  member_name: string
  check_in: string
  check_out: string | null
  status: string
}

interface AnomalyRecord {
  date: string
  member_name: string
  type: string
  severity: string
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const now = new Date().toISOString()

    const { data: dueReports, error: fetchError } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('active', true)
      .lte('next_run', now)

    if (fetchError) throw fetchError

    let processed = 0

    for (const report of dueReports ?? []) {
      let query = supabase.from('attendance_records').select('*')

      if (report.report_type === 'late-arrival') {
        query = query.eq('status', 'late')
      }

      const { data: records } = report.report_type === 'anomaly'
        ? await supabase.from('anomalies').select('*').eq('dismissed', false)
        : await query

      const rows = (records ?? [])
        .map((r: AttendanceRecord | AnomalyRecord) =>
          report.report_type === 'anomaly'
            ? `<tr><td>${r.date}</td><td>${r.member_name}</td><td>${(r as AnomalyRecord).type}</td><td>${(r as AnomalyRecord).severity}</td></tr>`
            : `<tr><td>${r.date}</td><td>${r.member_name}</td><td>${(r as AttendanceRecord).check_in}</td><td>${(r as AttendanceRecord).check_out ?? '—'}</td><td>${(r as AttendanceRecord).status}</td></tr>`
        )
        .join('')

      const headerRow = report.report_type === 'anomaly'
        ? '<tr><th>Date</th><th>Member</th><th>Type</th><th>Severity</th></tr>'
        : '<tr><th>Date</th><th>Member</th><th>Check In</th><th>Check Out</th><th>Status</th></tr>'

      const html = `
        <div style="font-family: Arial, sans-serif;">
          <div style="background:#1A1A1A;color:#F2B705;padding:16px;font-weight:bold;">
            SHERRIE SILVER FOUNDATION — ${report.name}
          </div>
          <p>Report type: ${report.report_type} | Frequency: ${report.frequency}</p>
          <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;">
            <thead>${headerRow}</thead>
            <tbody>${rows || '<tr><td colspan="5">No records found.</td></tr>'}</tbody>
          </table>
        </div>
      `

      const { data: creator } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', report.created_by)
        .maybeSingle()

      if (creator?.email) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'SSF Reports <onboarding@resend.dev>',
            to: [creator.email],
            subject: `Scheduled Report: ${report.name}`,
            html,
          }),
        })
      }

      const next = new Date()
      if (report.frequency === 'daily') next.setDate(next.getDate() + 1)
      else if (report.frequency === 'weekly') next.setDate(next.getDate() + 7)
      else if (report.frequency === 'monthly') next.setMonth(next.getMonth() + 1)

      await supabase
        .from('scheduled_reports')
        .update({ last_run: now, next_run: next.toISOString() })
        .eq('id', report.id)

      processed++
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})