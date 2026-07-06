import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatStatusLabel } from '@/lib/attendance'

interface RecordRow {
  id: string
  member_name: string
  barcode: string
  check_in: string
  check_out: string | null
  date: string
  duration_minutes: number | null
  status: string
}

interface ScheduledReport {
  id: string
  name: string
  frequency: string
  report_type: string
  active: boolean
  next_run: string | null
}

interface MemberOption {
  id: string
  name: string
  barcode: string
}

export function Reports() {
  const { user } = useAuth()
  const [tab, setTab] = useState('reports')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [memberFilter, setMemberFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [members, setMembers] = useState<MemberOption[]>([])
  const [records, setRecords] = useState<RecordRow[]>([])
  const [loading, setLoading] = useState(true)

  const [scheduled, setScheduled] = useState<ScheduledReport[]>([])
  const [reportName, setReportName] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [reportType, setReportType] = useState('full')

  useEffect(() => {
    supabase.from('members').select('id, name, barcode').order('name').then(({ data }) => setMembers(data ?? []))
    fetchScheduled()
  }, [])

  const fetchScheduled = async () => {
    const { data } = await supabase.from('scheduled_reports').select('*').order('created_at', { ascending: false })
    setScheduled(data ?? [])
  }

  const fetchRecords = async () => {
    setLoading(true)
    let query = supabase
      .from('attendance_records')
      .select('*')
      .order('check_in', { ascending: false })
      .limit(50)

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    if (memberFilter !== 'all') query = query.eq('barcode', memberFilter)
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data } = await query
    setRecords(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRecords()
  }, [startDate, endDate, memberFilter, statusFilter])

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setMemberFilter('all')
    setStatusFilter('all')
  }

  const onTimeCount = records.filter((r) => r.status !== 'late').length
  const lateCount = records.filter((r) => r.status === 'late').length
  const withDuration = records.filter((r) => r.duration_minutes != null)
  const avgMinutes =
    withDuration.length > 0
      ? Math.round(withDuration.reduce((sum, r) => sum + (r.duration_minutes ?? 0), 0) / withDuration.length)
      : 0

  const exportCsv = () => {
    const headers = ['Date', 'Member', 'Check In', 'Check Out', 'Duration (min)', 'Status']
    const rows = records.map((r) => [
      r.date,
      r.member_name,
      new Date(r.check_in).toLocaleTimeString(),
      r.check_out ? new Date(r.check_out).toLocaleTimeString() : '',
      r.duration_minutes ?? '',
      r.status,
    ])
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportPdf = () => {
    const win = window.open('', '_blank')
    if (!win) return

    const rowsHtml = records
      .map(
        (r) => `
        <tr>
          <td>${r.date}</td>
          <td>${r.member_name}</td>
          <td>${new Date(r.check_in).toLocaleTimeString()}</td>
          <td>${r.check_out ? new Date(r.check_out).toLocaleTimeString() : '—'}</td>
          <td>${r.duration_minutes != null ? `${Math.floor(r.duration_minutes / 60)}h ${r.duration_minutes % 60}m` : '—'}</td>
          <td>${formatStatusLabel(r.status)}</td>
        </tr>`
      )
      .join('')

    win.document.write(`
      <html>
        <head>
          <title>SSF Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { color: #1A1A1A; }
            .header-bar { background: #1A1A1A; color: #F2B705; padding: 12px 20px; margin-bottom: 20px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
            th { background: #F2B705; color: #1A1A1A; }
            .summary { display: flex; gap: 24px; margin-bottom: 16px; }
            .summary div { border-left: 4px solid #F2B705; padding-left: 8px; }
          </style>
        </head>
        <body>
          <div class="header-bar">SHERRIE SILVER FOUNDATION — ATTENDANCE REPORT</div>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <div class="summary">
            <div><strong>${records.length}</strong><br/>Total Records</div>
            <div><strong>${onTimeCount}</strong><br/>On Time</div>
            <div><strong>${lateCount}</strong><br/>Late</div>
            <div><strong>${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m</strong><br/>Avg Duration</div>
          </div>
          <table>
            <thead>
              <tr><th>Date</th><th>Member</th><th>Check In</th><th>Check Out</th><th>Duration</th><th>Status</th></tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  const handleScheduleReport = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextRun = new Date()
    nextRun.setDate(nextRun.getDate() + 1)
    nextRun.setHours(7, 0, 0, 0)

    await supabase.from('scheduled_reports').insert({
      name: reportName,
      frequency,
      report_type: reportType,
      created_by: user?.id,
      next_run: nextRun.toISOString(),
    })

    setReportName('')
    fetchScheduled()
  }

  const togglePause = async (id: string, active: boolean) => {
    await supabase.from('scheduled_reports').update({ active: !active }).eq('id', id)
    fetchScheduled()
  }

  const removeScheduled = async (id: string) => {
    await supabase.from('scheduled_reports').delete().eq('id', id)
    fetchScheduled()
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div>
                <Label>Member</Label>
                <Select value={memberFilter} onValueChange={setMemberFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.barcode}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Full Attendance (All Statuses)</SelectItem>
                    <SelectItem value="checked-in">Checked In</SelectItem>
                    <SelectItem value="checked-out">Checked Out</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="early-departure">Early Departure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={clearFilters} variant="outline" size="sm">Clear</Button>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={exportCsv} size="sm" className="bg-brand-orange text-black">Export to CSV</Button>
              <Button onClick={exportPdf} size="sm" className="bg-brand-charcoal text-white">Export to PDF</Button>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="text-2xl font-bold">{records.length}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-500">On Time</p>
              <p className="text-2xl font-bold">{onTimeCount}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-500">Late</p>
              <p className="text-2xl font-bold">{lateCount}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-500">Avg Duration</p>
              <p className="text-2xl font-bold">{Math.floor(avgMinutes / 60)}h {avgMinutes % 60}m</p>
            </Card>
          </div>

          <Card className="overflow-x-auto p-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : records.length === 0 ? (
              <p className="text-sm text-gray-500">No records match these filters.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2">Date</th>
                    <th>Member</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2">{r.date}</td>
                      <td>{r.member_name}</td>
                      <td>{new Date(r.check_in).toLocaleTimeString()}</td>
                      <td>{r.check_out ? new Date(r.check_out).toLocaleTimeString() : '—'}</td>
                      <td>{r.duration_minutes != null ? `${Math.floor(r.duration_minutes / 60)}h ${r.duration_minutes % 60}m` : '—'}</td>
                      <td>{formatStatusLabel(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4 space-y-4">
          <Card className="p-4">
            <h2 className="mb-3 font-semibold">Create Scheduled Report</h2>
            <form onSubmit={handleScheduleReport} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <Label>Report Name</Label>
                <Input value={reportName} onChange={(e) => setReportName(e.target.value)} required />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Attendance</SelectItem>
                    <SelectItem value="late-arrival">Late Arrivals</SelectItem>
                    <SelectItem value="absentee">Absentees</SelectItem>
                    <SelectItem value="anomaly">Anomaly Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full bg-brand-orange text-black">Schedule Report</Button>
              </div>
            </form>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 font-semibold">Existing Scheduled Reports</h2>
            {scheduled.length === 0 ? (
              <p className="text-sm text-gray-500">No scheduled reports yet.</p>
            ) : (
              <div className="space-y-2">
                {scheduled.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {s.frequency} — {s.report_type.replace('-', ' ')}
                        {s.next_run && ` — Next run: ${new Date(s.next_run).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.active ? 'Active' : 'Paused'}
                      </span>
                      <Button onClick={() => togglePause(s.id, s.active)} size="sm" variant="outline">
                        {s.active ? 'Pause' : 'Resume'}
                      </Button>
                      <Button onClick={() => removeScheduled(s.id)} size="sm" variant="outline" className="text-red-600">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}