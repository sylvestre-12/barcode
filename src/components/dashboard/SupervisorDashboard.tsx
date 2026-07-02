import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/card'
import { getSupervisorStatus } from '@/lib/dashboardQueries'
import { formatStatusLabel } from '@/lib/attendance'

export function SupervisorDashboard() {
  const { user } = useAuth()
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getSupervisorStatus>>>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupervisorStatus(user?.barcode ?? null).then((s) => {
      setStatus(s)
      setLoading(false)
    })
  }, [user])

  if (loading) return <div className="p-6">Loading dashboard...</div>

  if (!user?.barcode) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center text-gray-500">
          No barcode linked to your account — contact an administrator.
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-brand-charcoal">My Dashboard</h1>

      <Card className="p-6 transition-all duration-200 hover:shadow-md">
        <h2 className="mb-3 font-semibold text-brand-charcoal">Today's Status</h2>
        {!status?.todayRecord ? (
          <p className="text-gray-500">No check-in recorded today. Scan barcode <strong>{user.barcode}</strong> at the gate.</p>
        ) : (
          <div className="space-y-1 text-sm">
            <p><strong>Check-in:</strong> {new Date(status.todayRecord.check_in).toLocaleTimeString()}</p>
            {status.todayRecord.check_out && (
              <p><strong>Check-out:</strong> {new Date(status.todayRecord.check_out).toLocaleTimeString()}</p>
            )}
            {status.todayRecord.duration_minutes != null && (
              <p><strong>Duration:</strong> {Math.floor(status.todayRecord.duration_minutes / 60)}h {status.todayRecord.duration_minutes % 60}m</p>
            )}
            <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${status.todayRecord.status === 'late' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {status.todayRecord.status === 'late' ? 'Late Arrival' : 'On Time'}
            </span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-brand-orange p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">Days Present (30d)</p>
          <p className="text-2xl font-bold text-brand-charcoal">{status?.daysPresent ?? 0}</p>
        </Card>
        <Card className="border-l-4 border-l-brand-gold p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">On-Time Rate</p>
          <p className="text-2xl font-bold text-brand-charcoal">{status?.onTimeRate ?? 0}%</p>
        </Card>
        <Card className="border-l-4 border-l-brand-charcoal p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">Avg Hours/Day</p>
          <p className="text-2xl font-bold text-brand-charcoal">{status?.avgHours ?? 0}h</p>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="mb-3 font-semibold text-brand-charcoal">Recent Attendance History</h2>
        {status?.recentRecords.length === 0 ? (
          <p className="text-sm text-gray-500">No records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {status?.recentRecords.map((r) => (
                <tr key={r.id} className="border-b transition-colors hover:bg-brand-gold/10">
                  <td className="py-2">{r.date}</td>
                  <td>{new Date(r.check_in).toLocaleTimeString()}</td>
                  <td>{r.check_out ? new Date(r.check_out).toLocaleTimeString() : '—'}</td>
                  <td>{formatStatusLabel(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}