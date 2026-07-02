import { supabase } from './supabase'

export async function getCheckinCutoffHour(): Promise<number | null> {
  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'checkin_cutoff_hour')
    .maybeSingle()

  if (!data?.value) return null
  const hour = parseInt(data.value, 10)
  return Number.isNaN(hour) ? null : hour
}

export async function setCheckinCutoffHour(hour: number | null, userId: string): Promise<void> {
  await supabase
    .from('system_settings')
    .update({ value: hour === null ? '' : String(hour), updated_by: userId, updated_at: new Date().toISOString() })
    .eq('key', 'checkin_cutoff_hour')
}