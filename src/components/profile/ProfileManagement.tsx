import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'
import { generateTotpSecret, getTotpUri, verifyTotpCode } from '@/lib/totp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export function ProfileManagement() {
  const { user, session } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')

  const [twoFaSecret, setTwoFaSecret] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [twoFaMsg, setTwoFaMsg] = useState('')
  const [twoFaEnabled, setTwoFaEnabled] = useState(user?.two_fa_enabled ?? false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg('')

    const { error } = await supabase
      .from('profiles')
      .update({ name, phone })
      .eq('id', user!.id)

    if (!error) {
      await supabase.from('notifications').insert({
        type: 'system',
        scope: 'account',
        user_id: user!.id,
        title: 'Profile Updated',
        message: 'Your profile information was updated successfully.',
        severity: 'info',
      })
    }

    setSavingProfile(false)
    setProfileMsg(error ? `Error: ${error.message}` : 'Profile updated successfully.')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg('')

    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg('New password must be at least 6 characters.')
      return
    }

    setSavingPassword(true)

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user!.email,
      password: currentPassword,
    })

    if (verifyError) {
      setSavingPassword(false)
      setPasswordMsg('Current password is incorrect.')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (!updateError) {
      await supabase.from('notifications').insert({
        type: 'system',
        scope: 'account',
        user_id: user!.id,
        title: 'Password Changed',
        message: "Your password was changed successfully. If this wasn't you, contact an administrator immediately.",
        severity: 'warning',
      })
    }

    setSavingPassword(false)
    if (updateError) {
      setPasswordMsg(`Error: ${updateError.message}`)
    } else {
      setPasswordMsg('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const startTwoFaSetup = async () => {
    const secret = generateTotpSecret()
    setTwoFaSecret(secret)
    const uri = getTotpUri(secret, user!.email)
    const dataUrl = await QRCode.toDataURL(uri)
    setQrDataUrl(dataUrl)
  }

  const confirmTwoFa = async (e: React.FormEvent) => {
    e.preventDefault()
    const valid = verifyTotpCode(twoFaSecret, verifyCode)
    if (!valid) {
      setTwoFaMsg('Incorrect code. Please try again.')
      return
    }

    await supabase
      .from('profiles')
      .update({ two_fa_enabled: true, two_fa_secret: twoFaSecret })
      .eq('id', user!.id)

    await supabase.from('notifications').insert({
      type: 'system',
      scope: 'account',
      user_id: user!.id,
      title: 'Two-Factor Authentication Enabled',
      message: 'Two-factor authentication was successfully enabled on your account.',
      severity: 'info',
    })

    setTwoFaEnabled(true)
    setQrDataUrl('')
    setTwoFaMsg('Two-factor authentication enabled successfully.')
  }

  const disableTwoFa = async () => {
    await supabase
      .from('profiles')
      .update({ two_fa_enabled: false, two_fa_secret: null })
      .eq('id', user!.id)
    setTwoFaEnabled(false)
    setTwoFaMsg('Two-factor authentication disabled.')
  }

  const lastSignIn = session?.user?.last_sign_in_at
    ? new Date(session.user.last_sign_in_at).toLocaleString()
    : 'Unknown'

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Profile Management</h1>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ''} disabled />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed here. Contact an administrator.</p>
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 078XXXXXXX" />
          </div>
          {profileMsg && (
            <p className={profileMsg.startsWith('Error') ? 'text-sm text-red-500' : 'text-sm text-green-600'}>
              {profileMsg}
            </p>
          )}
          <Button type="submit" disabled={savingProfile} className="bg-brand-orange text-black hover:bg-brand-orange-dark">
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {passwordMsg && (
            <p className={passwordMsg.includes('success') ? 'text-sm text-green-600' : 'text-sm text-red-500'}>
              {passwordMsg}
            </p>
          )}
          <Button type="submit" disabled={savingPassword} className="bg-brand-charcoal text-white">
            {savingPassword ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Two-Factor Authentication</h2>
        {twoFaEnabled ? (
          <div className="space-y-3">
            <p className="text-sm text-green-600">2FA is currently enabled on your account.</p>
            <Button onClick={disableTwoFa} variant="outline" className="text-red-600">
              Disable 2FA
            </Button>
          </div>
        ) : !qrDataUrl ? (
          <Button onClick={startTwoFaSetup} className="bg-brand-charcoal text-white">
            Set Up Two-Factor Authentication
          </Button>
        ) : (
          <form onSubmit={confirmTwoFa} className="space-y-4">
            <p className="text-sm text-gray-600">Scan this QR code with your authenticator app (e.g. Google Authenticator):</p>
            <img src={qrDataUrl} alt="2FA QR Code" className="h-48 w-48" />
            <div className="rounded-md bg-gray-100 p-3">
              <p className="text-xs text-gray-500">Can't scan? Enter this code manually in your app instead:</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-brand-orange">{twoFaSecret}</p>
            </div>
            <div>
              <Label htmlFor="verifyCode">Enter the 6-digit code from your app</Label>
              <Input
                id="verifyCode"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                required
                className="text-center text-lg tracking-widest"
              />
            </div>
            {twoFaMsg && <p className="text-sm text-red-500">{twoFaMsg}</p>}
            <Button type="submit" className="bg-brand-orange text-black">
              Confirm and Enable
            </Button>
          </form>
        )}
        {twoFaMsg && twoFaEnabled && <p className="mt-2 text-sm text-green-600">{twoFaMsg}</p>}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Session Info</h2>
        <p className="text-sm text-gray-600">
          <strong>Last login:</strong> {lastSignIn}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Role:</strong> <span className="capitalize">{user?.role}</span>
        </p>
        <p className="text-sm text-gray-600">
          <strong>Username:</strong> {user?.username}
        </p>
        {user?.barcode && (
          <p className="text-sm text-gray-600">
            <strong>Linked Barcode:</strong> {user.barcode}
          </p>
        )}
      </Card>
    </div>
  )
}