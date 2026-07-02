import { useAuth } from '@/context/AuthContext'
import { AdminDashboard } from './AdminDashboard'
import { SupervisorDashboard } from './SupervisorDashboard'
import { StaffDashboard } from './StaffDashboard'

export function DashboardRouter() {
  const { user } = useAuth()

  if (user?.role === 'administrator') return <AdminDashboard />
  if (user?.role === 'supervisor') return <SupervisorDashboard />
  if (user?.role === 'staff') return <StaffDashboard />

  return <div className="p-6">Unknown role.</div>
}