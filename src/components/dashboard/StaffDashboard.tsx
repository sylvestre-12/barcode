import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { getStaffTeamSummary } from '@/lib/dashboardQueries'

export function StaffDashboard() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getStaffTeamSummary>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStaffTeamSummary().then((s) => {
      setSummary(s)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-6">Loading dashboard...</div>

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-brand-charcoal">Team Overview</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-brand-orange p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-3xl font-bold text-brand-charcoal">{summary?.totalMembers ?? 0}</p>
        </Card>
        <Card className="border-l-4 border-l-brand-gold p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">Present Today</p>
          <p className="text-3xl font-bold text-brand-charcoal">{summary?.presentToday ?? 0}</p>
        </Card>
        <Card className="border-l-4 border-l-brand-danger p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">Absent Today</p>
          <p className="text-3xl font-bold text-brand-charcoal">{summary?.absentToday ?? 0}</p>
        </Card>
        <Card className="border-l-4 border-l-red-500 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">Late Today</p>
          <p className="text-3xl font-bold text-brand-charcoal">{summary?.lateToday ?? 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4 transition-all duration-200 hover:shadow-md">
          <h2 className="mb-3 font-semibold text-brand-charcoal">Late Members</h2>
          {summary?.lateMembers.length === 0 ? (
            <p className="text-sm text-gray-500">No late arrivals today.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {summary?.lateMembers.map((m, i) => (
                <li key={i} className="flex justify-between rounded px-2 py-1 transition-colors hover:bg-brand-gold/10">
                  <span>{m.name}</span>
                  <span className="text-gray-400">{new Date(m.time).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4 transition-all duration-200 hover:shadow-md">
          <h2 className="mb-3 font-semibold text-brand-charcoal">Absent Members</h2>
          {summary?.absentMembers.length === 0 ? (
            <p className="text-sm text-gray-500">Everyone has checked in.</p>
          ) : (
            <ul className="space-y-1 text-sm text-gray-600">
              {summary?.absentMembers.map((name, i) => (
                <li key={i} className="rounded px-2 py-1 transition-colors hover:bg-brand-gold/10">{name}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}