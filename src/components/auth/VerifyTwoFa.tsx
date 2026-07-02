import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { verifyTotpCode } from '@/lib/totp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function VerifyTwoFa() {
  const { session, markTwoFaVerified, signOut } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) navigate('/login', { replace: true })
  }, [session])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: profile } = await supabase
      .from('profiles')
      .select('two_fa_secret')
      .eq('id', session!.user.id)
      .single()

    setLoading(false)

    if (!profile?.two_fa_secret || !verifyTotpCode(profile.two_fa_secret, code)) {
      setError('Incorrect code. Please try again.')
      return
    }

    markTwoFaVerified()
    navigate('/dashboard')
  }

  const handleCancel = async () => {
    await signOut()
    navigate('/login')
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
          <h1 className="text-xl font-bold text-black">Two-Factor Verification</h1>
          <p className="text-sm text-gray-600">Enter the 6-digit code from your authenticator app</p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <Label className="text-gray-700">Verification Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              autoFocus
              className="border-gray-300 bg-white text-center text-lg tracking-widest text-black"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-brand-orange text-black hover:bg-brand-orange-dark">
            {loading ? 'Verifying...' : 'Verify'}
          </Button>

          <button type="button" onClick={handleCancel} className="w-full text-center text-sm text-gray-500 underline">
            Cancel and sign out
          </button>
        </form>
      </div>
    </div>
  )
}
