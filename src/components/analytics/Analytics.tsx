import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  getAttendancePatterns,
  getWeeklyDayOfWeekTrend,
  getAnomalies,
  dismissAnomaly,
  detectAndInsertAnomalies,
  type MemberPattern,
  type AnomalyRow,
} from '@/lib/analytics'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const severityWeight = { low: 0, medium: 25, high: 75 }

export function Analytics() {
  const { user } = useAuth()
  const [tab, setTab] = useState('patterns')

  const [patterns, setPatterns] = useState<MemberPattern[]>([])
  const [weeklyTrend, setWeeklyTrend] = useState<{ day: string; present: number; late: number; total: number }[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyRow[]>([])
  const [sensitivity, setSensitivity] = useState(0)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    const [p, w, a] = await Promise.all([getAttendancePatterns(), getWeeklyDayOfWeekTrend(), getAnomalies()])
    setPatterns(p)
    setWeeklyTrend(w)
    setAnomalies(a)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleScanForAnomalies = async () => {
    setScanning(true)
    const count = await detectAndInsertAnomalies()
    setScanning(false)
    await loadAll()
    alert(`Scan complete. ${count ?? 0} new anomalies detected.`)
  }

  const handleDismiss = async (id: string) => {
    if (!user) return
    await dismissAnomaly(id, user.id)
    loadAll()
  }

  const visibleAnomalies = anomalies.filter((a) => !a.dismissed && severityWeight[a.severity] >= sensitivity)
  const dismissedCount = anomalies.filter((a) => a.dismissed).length

  const mostPunctual = [...patterns].filter(p => p.totalDays > 0).sort((a, b) => a.lateDays - b.lateDays)[0]
  const longestHours = [...patterns].sort((a, b) => b.avgDurationMinutes - a.avgDurationMinutes)[0]
  const bestAttendance = [...patterns].sort((a, b) => b.attendanceRate - a.attendanceRate)[0]

  if (loading) return <div className="p-6">Loading analytics...</div>

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="patterns">Attendance Patterns</TabsTrigger>
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-sm text-gray-500">Most Punctual</p>
              <p className="text-lg font-bold">{mostPunctual?.name ?? '—'}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-500">Longest Hours</p>
              <p className="text-lg font-bold">{longestHours?.name ?? '—'}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-500">Best Attendance</p>
              <p className="text-lg font-bold">{bestAttendance?.name ?? '—'}</p>
            </Card>
          </div>

          <Card className="overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2">Member</th>
                  <th>Avg Check-In</th>
                  <th>Avg Check-Out</th>
                  <th>Avg Duration</th>
                  <th>Total Days</th>
                  <th>Late Days</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {patterns.map((p) => (
                  <tr key={p.barcode} className="border-b">
                    <td className="py-2">{p.name}</td>
                    <td>{p.avgCheckIn}</td>
                    <td>{p.avgCheckOut}</td>
                    <td>{Math.floor(p.avgDurationMinutes / 60)}h {p.avgDurationMinutes % 60}m</td>
                    <td>{p.totalDays}</td>
                    <td>{p.lateDays}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-brand-orange"
                            style={{ width: `${p.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-xs">{p.attendanceRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-4 space-y-4">
          <Card className="p-4">
            <h2 className="mb-4 font-semibold">Day-of-Week Trend (last 30 days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyTrend}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#F2B705" name="Present" />
                <Bar dataKey="late" fill="#E74C3C" name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 font-semibold">Peak Attendance Days</h2>
            <div className="space-y-2">
              {[...weeklyTrend].sort((a, b) => b.total - a.total).map((d) => {
                const maxTotal = Math.max(...weeklyTrend.map((w) => w.total), 1)
                return (
                  <div key={d.day} className="flex items-center gap-3">
                    <span className="w-12 text-sm">{d.day}</span>
                    <div className="h-3 flex-1 rounded-full bg-gray-200">
                      <div
                        className="h-3 rounded-full bg-brand-orange"
                        style={{ width: `${(d.total / maxTotal) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm">{d.total}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Detection Sensitivity</h2>
              <Button onClick={handleScanForAnomalies} disabled={scanning} size="sm" className="bg-brand-charcoal text-white">
                {scanning ? 'Scanning...' : 'Scan for New Anomalies'}
              </Button>
            </div>
            <input
              type="range"
              min={0}
              max={75}
              step={25}
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="mt-3 w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Show All</span>
              <span>High Severity Only</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Showing {visibleAnomalies.length} of {anomalies.length} anomalies ({dismissedCount} dismissed as false positives)
            </p>
          </Card>

          <Card className="overflow-x-auto p-4">
            {visibleAnomalies.length === 0 ? (
              <p className="text-sm text-gray-500">No anomalies at this sensitivity level.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2">Type</th>
                    <th>Member</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAnomalies.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="py-2 capitalize">{a.type.replace('-', ' ')}</td>
                      <td>{a.member_name}</td>
                      <td>{a.date}</td>
                      <td>{a.description}</td>
                      <td>
                        <span className={`rounded px-2 py-1 text-xs font-medium capitalize ${
                          a.severity === 'high' ? 'bg-red-100 text-red-700' :
                          a.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {a.severity}
                        </span>
                      </td>
                      <td>
                        <Button onClick={() => handleDismiss(a.id)} variant="outline" size="sm">
                          False Positive
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}