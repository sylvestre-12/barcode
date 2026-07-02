import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface LogRow {
  id: string
  actor_name: string
  action: string
  target_type: string | null
  target_id: string | null
  previous_value: any
  new_value: any
  created_at: string
}

export function AuditLogs() {
  const [logs, setLogs] = useState<LogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const fetchLogs = async () => {
    setLoading(true)
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate + 'T23:59:59')
    if (actionFilter) query = query.ilike('action', `%${actionFilter}%`)
    const { data } = await query
    setLogs(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [startDate, endDate, actionFilter])

  const exportCsv = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Target Type', 'Target ID']
    const rows = logs.map((l) => [l.created_at, l.actor_name, l.action, l.target_type ?? '', l.target_id ?? ''])
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <Label>Action contains</Label>
            <Input placeholder="e.g. CHECK_IN" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={exportCsv} size="sm" className="w-full bg-brand-orange text-black">Export CSV</Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-x-auto p-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-500">No logs match these filters.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="py-2">{new Date(l.created_at).toLocaleString()}</td>
                  <td>{l.actor_name}</td>
                  <td><span className="rounded bg-gray-100 px-2 py-1 text-xs font-mono">{l.action}</span></td>
                  <td>{l.target_type ? `${l.target_type}: ${l.target_id}` : '—'}</td>
                  <td className="max-w-xs truncate text-xs text-gray-500">
                    {l.new_value ? JSON.stringify(l.new_value) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}