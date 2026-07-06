import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { generateOtp, otpExpiryISO } from '@/lib/otp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()
    if (!profile) {
      setLoading(false)
      setError('No account found with that email.')
      return
    }

    const otp = generateOtp()
    await supabase.from('pending_registrations').upsert({
      email,
      name: '', phone: '', username: '', password: '', role: 'staff',
      otp,
      otp_expires_at: otpExpiryISO(),
    })

    const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
      body: { email, otp, type: 'reset' },
    })

    setLoading(false)

    if (emailError) {
      setError('Could not send reset email. Please contact an administrator.')
      return
    }

    navigate('/verify-reset', { state: { email } })
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 md:p-10"
    >
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleSubmit}
          className="relative space-y-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 pt-9 shadow-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-orange" />
          <h1 className="text-2xl font-bold text-black">Reset Password</h1>
          <p className="text-sm text-gray-600">Enter your email and we'll send you a reset code.</p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <Label className="text-gray-700">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-300 bg-white text-black placeholder:text-gray-400"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-brand-orange text-black hover:bg-brand-orange-dark">
            {loading ? 'Sending...' : 'Send Reset Code'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <a href="/login" className="text-brand-gold underline">Back to Login</a>
          </p>
        </form>
      </div>
    </div>
  )
}
