import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowUp, Maximize } from 'lucide-react'
import { toast } from 'sonner'

interface ActivityRecord {
  id: string
  member_name: string
  barcode: string
  check_in: string
  check_out: string | null
  duration_minutes: number | null
  status: string
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  return `${diffHr}h ago`
}

function playChime() {
  const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=')
  audio.play().catch(() => {})
}

export function LiveActivity() {
  const [records, setRecords] = useState<ActivityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const fetchRecords = async () => {
    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .order('check_in', { ascending: false })
      .limit(20)
    setRecords(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRecords()

    const channel = supabase
      .channel('live-activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, (payload) => {
        fetchRecords()

        const record = payload.new as ActivityRecord
        if (!record) return

        const isLate = record.status === 'late'
        const isCheckOut = !!record.check_out

        if (isLate) {
          toast.warning(`${record.member_name} arrived late`, {
            description: new Date(record.check_in).toLocaleTimeString(),
          })
          if (soundEnabled) playChime()
        } else {
          toast(`${record.member_name} ${isCheckOut ? 'checked out' : 'checked in'}`, {
            description: new Date(isCheckOut ? record.check_out! : record.check_in).toLocaleTimeString(),
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [soundEnabled])

  const today = new Date().toISOString().split('T')[0]
  const todayRecords = records.filter((r) => r.check_in.startsWith(today))
  const checkInsToday = todayRecords.length
  const checkOutsToday = todayRecords.filter((r) => r.check_out).length

  const goFullscreen = () => {
    document.documentElement.requestFullscreen?.()
  }

  if (loading) return <div className="p-6">Loading live activity...</div>

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Gate Activity</h1>
        <div className="flex gap-2">
          <Button onClick={() => setSoundEnabled((s) => !s)} variant="outline" size="sm">
            {soundEnabled ? '🔔 Sound On' : '🔕 Sound Off'}
          </Button>
          <Button onClick={goFullscreen} variant="outline" size="sm">
            <Maximize className="mr-2 h-4 w-4" /> Fullscreen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Last 24 Hours</p>
          <p className="text-3xl font-bold">{records.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Check-Ins Today</p>
          <p className="text-3xl font-bold">{checkInsToday}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-500">Check-Outs Today</p>
          <p className="text-3xl font-bold">{checkOutsToday}</p>
        </Card>
      </div>

      <Card className="divide-y p-0">
        {records.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No activity yet.</p>
        ) : (
          records.map((r) => {
            const isCheckOut = !!r.check_out
            return (
              <div
                key={r.id}
                className={`flex items-center justify-between p-4 ${isCheckOut ? 'bg-brand-orange/10' : 'bg-brand-charcoal/5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isCheckOut ? 'bg-brand-orange text-black' : 'bg-brand-charcoal text-white'}`}>
                    {isCheckOut ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{r.member_name}</p>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span className="rounded bg-gray-200 px-1.5 py-0.5">
                        {isCheckOut ? 'CHECK-OUT' : 'CHECK-IN'}
                      </span>
                      {r.status === 'late' && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700">LATE</span>
                      )}
                      <span>{r.barcode}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p>{new Date(isCheckOut ? r.check_out! : r.check_in).toLocaleTimeString()}</p>
                  <p className="text-xs text-gray-400">{timeAgo(isCheckOut ? r.check_out! : r.check_in)}</p>
                  {isCheckOut && r.duration_minutes != null && (
                    <p className="text-xs text-gray-500">{Math.floor(r.duration_minutes / 60)}h {r.duration_minutes % 60}m</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}