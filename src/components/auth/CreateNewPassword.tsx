import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CreateNewPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const { email, code } = (location.state as { email?: string; code?: string }) ?? {}

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError('Password must be at least 8 characters and include an uppercase letter, a number, and a special character.')
      return
    }

    setLoading(true)

    const { data, error: fnError } = await supabase.functions.invoke('reset-password', {
      body: { email, otp: code, newPassword: password },
    })

    setLoading(false)

    if (fnError || data?.error) {
      setError(data?.error ?? 'Failed to reset password. Please try again.')
      return
    }

    alert('Password reset successfully. Please sign in with your new password.')
    navigate('/login')
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 md:p-10"
    >
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="relative space-y-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 pt-9 shadow-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-orange" />
          <h1 className="text-2xl font-bold text-black">Set New Password</h1>
          <p className="text-sm text-gray-600">Enter and confirm your new password below.</p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <Label className="text-gray-700">New Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-gray-300 bg-white text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-gray-700">Confirm Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border-gray-300 bg-white text-black placeholder:text-gray-400"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange text-black hover:bg-brand-orange-dark"
          >
            {loading ? 'Saving...' : 'Update Password'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <a href="/login" className="text-brand-gold underline">Sign In</a>
          </p>
        </form>
      </div>
    </div>
  )
}