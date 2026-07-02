export type UserRole = 'administrator' | 'supervisor' | 'staff'

export interface Profile {
  id: string
  username: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  barcode: string | null
  email_verified: boolean
  two_fa_enabled: boolean
  created_at: string
}