import { supabase } from './supabase'

const DEVICE_TOKEN_KEY = 'ssf_device_token'
const TRUST_DAYS = 30

function getOrCreateDeviceToken(): string {
  let token = localStorage.getItem(DEVICE_TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(DEVICE_TOKEN_KEY, token)
  }
  return token
}

export async function isDeviceTrusted(userId: string): Promise<boolean> {
  const token = getOrCreateDeviceToken()

  const { data } = await supabase
    .from('trusted_devices')
    .select('expires_at')
    .eq('user_id', userId)
    .eq('device_token', token)
    .maybeSingle()

  if (!data) return false
  return new Date(data.expires_at) > new Date()
}

export async function trustThisDevice(userId: string): Promise<void> {
  const token = getOrCreateDeviceToken()
  const expiresAt = new Date(Date.now() + TRUST_DAYS * 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('trusted_devices').upsert(
    { user_id: userId, device_token: token, expires_at: expiresAt },
    { onConflict: 'device_token' }
  )
}