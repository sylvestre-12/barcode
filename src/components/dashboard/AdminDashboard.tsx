import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAdminKpis, getWeeklyTrend } from '@/lib/dashboardQueries'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function AdminDashboard() {
  const [kpis, setKpis] = useState({ totalMembers: 0, presentToday: 0, absentToday: 0, lateToday: 0 })
  const [trend, setTrend] = useState<{ day: string; present: number; late: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminKpis(), getWeeklyTrend()]).then(([k, t]) => {
      setKpis(k)
      setTrend(t)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-6">Loading dashboard...</div>

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-brand-charcoal">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-brand-orange p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-3xl font-bold text-brand-charcoal">{kpis.totalMembers}</p>
        </Card>
        <Card className="border-l-4 border-l-brand-gold p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">Present Today</p>
          <p className="text-3xl font-bold text-brand-charcoal">{kpis.presentToday}</p>
          <p className="text-xs text-gray-400">
            {kpis.totalMembers > 0 ? Math.round((kpis.presentToday / kpis.totalMembers) * 100) : 0}%
          </p>
        </Card>
        <Card className="border-l-4 border-l-brand-danger p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">Absent Today</p>
          <p className="text-3xl font-bold text-brand-charcoal">{kpis.absentToday}</p>
        </Card>
        <Card className="border-l-4 border-l-red-500 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-gray-500">Late Arrivals</p>
          <p className="text-3xl font-bold text-brand-charcoal">{kpis.lateToday}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="mb-4 font-semibold text-brand-charcoal">Weekly Attendance Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trend}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" fill="#F2B705" name="Present" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" fill="#E74C3C" name="Late" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h2 className="mb-4 font-semibold text-brand-charcoal">Quick Actions</h2>
        <div className="flex gap-3">
          <Link to="/scanner">
            <Button className="bg-brand-orange text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-orange-dark hover:shadow-md">
              Go to Scanner
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}