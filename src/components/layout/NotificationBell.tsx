import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AccountNotification {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
  severity: string | null
}

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AccountNotification[]>([])

  const fetchNotifications = async () => {
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('scope', 'account')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setNotifications(data ?? [])
  }

  useEffect(() => {
    fetchNotifications()

    if (!user) return
    const channel = supabase
      .channel('account-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchNotifications()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const markAllRead = async () => {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('scope', 'account')
      .eq('user_id', user.id)
      .eq('read', false)
    fetchNotifications()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) markAllRead() }}>
      <DropdownMenuTrigger asChild>
        <button className="relative cursor-pointer" aria-label="Account notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-danger text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Account Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-3 text-sm text-gray-500">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 whitespace-normal">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-gray-500">{n.message}</p>
              <p className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer text-sm text-brand-orange">
            Manage account settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}