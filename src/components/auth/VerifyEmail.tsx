import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { generateOtp, otpExpiryISO } from '@/lib/otp'
import { logAction } from '@/lib/audit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string })?.email ?? ''

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: pending, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError || !pending) {
      setLoading(false)
      setError('Registration not found. Please register again.')
      return
    }

    if (new Date(pending.otp_expires_at) < new Date()) {
      setLoading(false)
      setError('Code expired. Please request a new one.')
      return
    }

    if (pending.otp !== code) {
      setLoading(false)
      setError('Incorrect code.')
      return
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: pending.email,
      password: pending.password,
    })

    if (signUpError || !authData.user) {
      setLoading(false)
      setError(signUpError?.message ?? 'Failed to create account.')
      return
    }

    const prefix = pending.role === 'supervisor' ? 'SUP' : 'STA'
    const barcode = `${prefix}${Date.now().toString().slice(-5)}`

    await supabase.from('profiles').insert({
      id: authData.user.id,
      username: pending.username,
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      role: pending.role,
      barcode,
      email_verified: true,
    })

    await supabase.from('members').insert({
      barcode,
      name: pending.name,
      department: null,
      role: pending.role === 'supervisor' ? 'Supervisor' : 'Staff',
      email: pending.email,
    })

    await supabase.from('notifications').insert({
      type: 'system',
      scope: 'attendance',
      title: 'New User Registered',
      message: `${pending.name} (${pending.role}) registered. Assigned barcode: ${barcode}`,
      target_role: 'administrator',
    })

    await logAction({ actorId: authData.user.id, actorName: pending.name, action: 'USER_REGISTERED', targetType: 'profile', targetId: authData.user.id })

    await supabase.from('pending_registrations').delete().eq('email', email)

    setLoading(false)
    alert(`Account created! Your barcode is: ${barcode}`)
    navigate('/login')
  }

  const handleResend = async () => {
    const otp = generateOtp()
    await supabase
      .from('pending_registrations')
      .update({ otp, otp_expires_at: otpExpiryISO() })
      .eq('email', email)

    const { error } = await supabase.functions.invoke('send-otp-email', {
      body: { email, otp, type: 'verification' },
    })

    if (error) {
      alert('Could not resend code. Please try again or contact an administrator.')
    } else {
      alert('A new verification code has been sent to your email.')
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 md:p-10"
    >
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleVerify}
          className="relative space-y-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 pt-9 shadow-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-orange" />
          <h1 className="text-xl font-bold text-black">Verify Your Email</h1>
          <p className="text-sm text-gray-600">Enter the 6-digit code sent to {email}</p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <Label className="text-gray-700">Verification Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              className="border-gray-300 bg-white text-center text-lg tracking-widest text-black"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-brand-orange text-black hover:bg-brand-orange-dark">
            {loading ? 'Verifying...' : 'Verify'}
          </Button>

          <button type="button" onClick={handleResend} className="w-full text-center text-sm text-brand-gold underline">
            Resend Code
          </button>
        </form>
      </div>
    </div>
  )
}
