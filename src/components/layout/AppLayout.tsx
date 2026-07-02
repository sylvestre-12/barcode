import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { NavBar } from './NavBar'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'

export function AppLayout() {
  const { showWarning } = useSessionTimeout()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {showWarning && (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
          ⚠️ Your session will expire in 5 minutes due to inactivity.
        </div>
      )}
      <Header />
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}