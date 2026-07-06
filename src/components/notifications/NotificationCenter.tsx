import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BroadcastComposer } from './BroadcastComposer'

interface AttendanceNotification {
  id: string
  type: string
  title: string
  message: string
  severity: string | null
  read: boolean
  target_role: string | null
  created_at: string
}

export function NotificationCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AttendanceNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('scope', 'attendance')
      .or(`target_role.is.null,target_role.eq.${user?.role}`)
      .order('created_at', { ascending: false })
      .limit(100)
    setNotifications(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('attendance-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('scope', 'attendance')
      .eq('read', false)
    fetchNotifications()
  }

  const markOneRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    fetchNotifications()
  }

  const filtered = notifications.filter((n) => {
    if (tab === 'all') return true
    if (tab === 'unread') return !n.read
    if (tab === 'check-ins') return n.type === 'check-in' || n.type === 'check-out'
    if (tab === 'late') return n.type === 'late-arrival'
    if (tab === 'anomalies') return n.type === 'anomaly'
    if (tab === 'system') return n.type === 'system' || n.type === 'broadcast'
    return true
  })

  const borderColor = (severity: string | null) => {
    if (severity === 'error') return 'border-l-red-500'
    if (severity === 'warning') return 'border-l-amber-500'
    return 'border-l-gray-300'
  }

  if (loading) return <div className="p-6">Loading notifications...</div>

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notification Center</h1>
        <Button onClick={markAllRead} variant="outline" size="sm">
          Mark all as read
        </Button>
      </div>

      {user?.role === 'administrator' && <BroadcastComposer />}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="check-ins">Check-Ins</TabsTrigger>
          <TabsTrigger value="late">Late Arrivals</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications here.</p>
          ) : (
            filtered.map((n) => (
              <Card
                key={n.id}
                onClick={() => !n.read && markOneRead(n.id)}
                className={`cursor-pointer border-l-4 p-4 ${borderColor(n.severity)} ${!n.read ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-gray-600">{n.message}</p>
                  </div>
                  {!n.read && <span className="ml-2 h-2 w-2 shrink-0 rounded-full bg-brand-orange" />}
                </div>
                <p className="mt-1 text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}