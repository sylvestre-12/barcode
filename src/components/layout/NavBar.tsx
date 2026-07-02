import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const TABS_BY_ROLE: Record<string, { label: string; path: string }[]> = {
  administrator: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Live Activity', path: '/live-activity' },
    { label: 'Records', path: '/records' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Reports', path: '/reports' },
    { label: 'Barcodes', path: '/barcodes' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'Audit Logs', path: '/audit-logs' },
    
  ],
  supervisor: [
    { label: 'My Dashboard', path: '/my-dashboard' },
    { label: 'Scanner', path: '/scanner' },
    { label: 'Notifications', path: '/notifications' },
    ],
  staff: [
    { label: 'Overview', path: '/my-dashboard' },
    { label: 'Live Activity', path: '/live-activity' },
    { label: 'Attendance', path: '/records' },
    { label: 'Scanner', path: '/scanner' },
    { label: 'Reports', path: '/reports' },
    { label: 'Notifications', path: '/notifications' },
    
  ],
}

export function NavBar() {
  const { user } = useAuth()
  if (!user) return null

  const tabs = TABS_BY_ROLE[user.role] ?? []

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            cn(
              'whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#F2B705] text-[#1A1A1A]'
                : 'text-gray-600 hover:bg-[#F2B705]/20'
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}