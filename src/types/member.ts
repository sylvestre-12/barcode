export interface Member {
  id: string
  barcode: string
  name: string
  department: string | null
  role: string
  email: string | null
  barcode_active: boolean
  barcode_expires_at: string | null
  created_at: string
}

export interface AttendanceRecord {
  id: string
  member_id: string
  member_name: string
  barcode: string
  check_in: string
  check_out: string | null
  date: string
  duration_minutes: number | null
  status: 'checked-in' | 'checked-out' | 'late' | 'early-departure' | 'absent' | 'overtime'
  is_overtime: boolean
  on_break: boolean
  break_start_time: string | null
  notes: string | null
}