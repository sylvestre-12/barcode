import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function VerifyResetOTP() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string })?.email ?? ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data: pending } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', email)
      .single()

    if (!pending || pending.otp !== code) {
      setError('Incorrect code.')
      return
    }
    if (new Date(pending.otp_expires_at) < new Date()) {
      setError('Code expired.')
      return
    }

    navigate('/reset-password', { state: { email, code } })
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
          <h1 className="text-xl font-bold text-black">Enter Reset Code</h1>
          <p className="text-sm text-gray-600">Enter the code sent to {email}</p>

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

          <Button type="submit" className="w-full bg-brand-orange text-black hover:bg-brand-orange-dark">
            Verify
          </Button>
        </form>
      </div>
    </div>
  )
}
