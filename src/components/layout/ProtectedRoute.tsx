import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading, user, twoFaVerified } = useAuth()

  if (loading) return <div className="p-8">Loading...</div>
  if (!session) return <Navigate to="/login" replace />
  if (user?.two_fa_enabled && !twoFaVerified) return <Navigate to="/verify-2fa" replace />

  return <>{children}</>
}