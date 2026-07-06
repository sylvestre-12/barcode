import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
  scanned_by_name: string | null
}

interface MemberOption {
  id: string
  name: string
  barcode: string
}

const PAGE_SIZE = 50

export function AttendanceRecords() {
  const [records, setRecords] = useState<RecordRow[]>([])
  const [members, setMembers] = useState<MemberOption[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [memberFilter, setMemberFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    supabase
      .from('members')
      .select('id, name, barcode')
      .order('name')
      .then(({ data }) => setMembers(data ?? []))
  }, [])

  const fetchRecords = async () => {
    setLoading(true)

    let query = supabase
      .from('attendance_records')
      .select('*', { count: 'exact' })
      .order('check_in', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    if (memberFilter !== 'all') query = query.eq('barcode', memberFilter)
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data, count } = await query
    setRecords(data ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    fetchRecords()
  }, [page, startDate, endDate, memberFilter, statusFilter])

  const totalRecords = totalCount
  const onTimeCount = records.filter((r) => r.status !== 'late').length
  const lateCount = records.filter((r) => r.status === 'late').length
  const withDuration = records.filter((r) => r.duration_minutes != null)
  const avgMinutes =
    withDuration.length > 0
      ? Math.round(withDuration.reduce((sum, r) => sum + (r.duration_minutes ?? 0), 0) / withDuration.length)
      : 0

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setMemberFilter('all')
    setStatusFilter('all')
    setPage(0)
  }

  const exportCsv = () => {
    const headers = ['Date', 'Member', 'Check In', 'Check Out', 'Duration (min)', 'Status', 'Scanned By']
    const rows = records.map((r) => [
      r.date,
      r.member_name,
      new Date(r.check_in).toLocaleTimeString(),
      r.check_out ? new Date(r.check_out).toLocaleTimeString() : '',
      r.duration_minutes ?? '',
      r.status,
      r.scanned_by_name ?? '',
    ])
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance_records_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Attendance Records</h1>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0) }} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0) }} />
          </div>
          <div>
            <Label>Member</Label>
            <Select value={memberFilter} onValueChange={(v) => { setMemberFilter(v); setPage(0) }}>
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
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0) }}>
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
            <Button onClick={clearFilters} variant="outline" size="sm">Clear Filters</Button>
            <Button onClick={exportCsv} size="sm" className="bg-brand-orange text-black">Export CSV</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-2xl font-bold">{totalRecords}</p>
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
                <th>Scanned By</th>
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
                  <td>
                    <span className={`rounded px-2 py-1 text-xs font-medium ${
                      r.status === 'late' ? 'bg-red-100 text-red-700' :
                      r.status === 'early-departure' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {formatStatusLabel(r.status)}
                    </span>
                  </td>
                  <td>{r.scanned_by_name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}