import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logo from '@/assets/ssf-logo.png'

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailReadOnly, setEmailReadOnly] = useState(true)
  const [passwordReadOnly, setPasswordReadOnly] = useState(true)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const checkLockout = async (identifier: string) => {
    const { data } = await supabase.from('login_attempts').select('*').eq('username', identifier).maybeSingle()
    if (data?.locked_until && new Date(data.locked_until) > new Date()) {
      return data.locked_until as string
    }
    return null
  }

  const recordFailedAttempt = async (identifier: string) => {
    const { data: existing } = await supabase.from('login_attempts').select('*').eq('username', identifier).maybeSingle()
    if (!existing) {
      await supabase.from('login_attempts').insert({ username: identifier, attempt_count: 1 })
      return MAX_ATTEMPTS - 1
    }
    const newCount = existing.attempt_count + 1
    const locked_until = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString() : null
    await supabase.from('login_attempts').update({ attempt_count: newCount, locked_until, last_attempt: new Date().toISOString() }).eq('username', identifier)
    if (locked_until) await logAction({ actorId: null, actorName: identifier, action: 'USER_LOCKED' })
    return Math.max(MAX_ATTEMPTS - newCount, 0)
  }

  const clearAttempts = async (identifier: string) => {
    await supabase.from('login_attempts').delete().eq('username', identifier)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const lockUntil = await checkLockout(email)
    if (lockUntil) {
      setError(`Account locked. Try again after ${new Date(lockUntil).toLocaleTimeString()}.`)
      return
    }

    try {
      await signIn(email, password)
      await clearAttempts(email)
      await logAction({ actorId: null, actorName: email, action: 'USER_LOGIN' })
      navigate('/dashboard')
    } catch (err: any) {
      const remaining = await recordFailedAttempt(email)
      await logAction({ actorId: null, actorName: email, action: 'USER_LOGIN_FAILED' })
      setError(remaining > 0 ? `Invalid credentials. ${remaining} attempt(s) remaining.` : 'Account locked due to too many failed attempts.')
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 md:p-10"
    >
      <div className="animate-gentle-float absolute left-6 top-6 md:left-10 md:top-10">
        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-black p-2 shadow-lg md:h-28 md:w-28">
          <img
            src={logo}
            alt="Sherrie Silver Foundation"
            className="h-full w-full rounded-lg object-contain"
          />
        </div>
      </div>

      <div className="animate-fade-up w-full max-w-sm">
        <form
          onSubmit={handleSubmit}
          className="relative space-y-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 pt-9 shadow-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-orange" />
          <h1 className="text-2xl font-bold text-black">Welcome back</h1>
          <p className="-mt-2 text-sm text-gray-600">Sign in to manage attendance</p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailReadOnly(false)}
              readOnly={emailReadOnly}
              required
              className="border-gray-300 bg-white text-black placeholder:text-gray-400"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordReadOnly(false)}
              readOnly={passwordReadOnly}
              required
              className="border-gray-300 bg-white text-black placeholder:text-gray-400"
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit" className="w-full bg-brand-orange text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-orange-dark hover:shadow-md">
            Sign in
          </Button>

          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="flex justify-between text-sm">
            <a href="/register" className="text-brand-gold underline">Create account</a>
            <a href="/forgot-password" className="text-brand-gold underline">Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  )
}