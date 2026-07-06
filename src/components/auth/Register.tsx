import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { generateOtp, otpExpiryISO } from '@/lib/otp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<'staff' | 'supervisor'>('staff')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordStrength = () => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

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

    const otp = generateOtp()
    const { error: insertError } = await supabase.from('pending_registrations').upsert({
      email,
      name,
      phone,
      username,
      password,
      role,
      otp,
      otp_expires_at: otpExpiryISO(),
    })

    if (insertError) {
      setLoading(false)
      setError(insertError.message)
      return
    }

    const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
      body: { email, otp, type: 'verification', name },
    })

    setLoading(false)

    if (emailError) {
      console.error('Failed to send OTP email:', emailError)
      alert('Account details saved, but we could not send the verification email. Please contact an administrator.')
    } else {
      alert('A verification code has been sent to your email.')
    }

    navigate('/verify-email', { state: { email } })
  }

  const strength = passwordStrength()
  const strengthLabel = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-green-400', 'bg-green-600'][strength]

  return (
    <div className="flex min-h-screen bg-white">

      {/* ── Left stripe panel ── */}
      <div className="relative hidden w-48 shrink-0 overflow-hidden bg-black md:block lg:w-64">
        <div className="absolute inset-y-0 right-0 w-1.5 bg-brand-orange" />
      </div>

      {/* ── Right: centered form area ── */}
      <div className="flex flex-1 items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-up">
          <form
            onSubmit={handleSubmit}
            className="relative space-y-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 pt-9 shadow-2xl"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-orange" />
            <h1 className="text-2xl font-bold text-black">Create Account</h1>
            <p className="text-sm text-gray-600">Fill in the details below to get started.</p>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <Label className="text-gray-700">Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-gray-300 bg-white text-black placeholder:text-gray-400"
              />
            </div>
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
            <div>
              <Label className="text-gray-700">Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-gray-300 bg-white text-black placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label className="text-gray-700">Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-gray-300 bg-white text-black placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label className="text-gray-700">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as 'staff' | 'supervisor')}>
                <SelectTrigger className="border-gray-300 bg-white text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-gray-200">
                  <SelectItem value="staff" className="focus:bg-yellow-100">Staff</SelectItem>
                  <SelectItem value="supervisor" className="focus:bg-yellow-100">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-700">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 bg-white text-black placeholder:text-gray-400"
              />
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="h-1.5 w-full rounded-full bg-gray-200">
                    <div className={`h-1.5 rounded-full ${strengthColor}`} style={{ width: `${(strength / 4) * 100}%` }} />
                  </div>
                  <p className="text-xs text-gray-600">{strengthLabel}</p>
                  <ul className="space-y-1 text-xs">
                    <li className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                      {password.length >= 8 ? '✓' : '○'} At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} At least one uppercase letter
                    </li>
                    <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {/[0-9]/.test(password) ? '✓' : '○'} At least one number
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} At least one special character
                    </li>
                  </ul>
                </div>
              )}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-brand-gold underline">Sign In</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}