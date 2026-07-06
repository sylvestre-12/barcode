import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

const TIMEOUT_MS = 30 * 60 * 1000
const WARNING_MS = 25 * 60 * 1000

export function useSessionTimeout() {
  const { signOut, session } = useAuth()
  const navigate = useNavigate()
  const [showWarning, setShowWarning] = useState(false)

  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimers = () => {
    setShowWarning(false)

    if (warningTimer.current) clearTimeout(warningTimer.current)
    if (logoutTimer.current) clearTimeout(logoutTimer.current)

    warningTimer.current = setTimeout(() => {
      setShowWarning(true)
    }, WARNING_MS)

    logoutTimer.current = setTimeout(async () => {
      await signOut()
      navigate('/login')
    }, TIMEOUT_MS)
  }

  useEffect(() => {
    if (!session) return

    resetTimers()

    const events = ['mousemove', 'keydown', 'click', 'scroll']
    events.forEach((evt) => window.addEventListener(evt, resetTimers))

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetTimers))

      if (warningTimer.current) clearTimeout(warningTimer.current)
      if (logoutTimer.current) clearTimeout(logoutTimer.current)
    }
  }, [session])

  return { showWarning }
}