import { supabase } from './supabase'

export async function logAction(params: {
  actorId: string | null
  actorName: string
  action: string
  targetType?: string
  targetId?: string
  previousValue?: any
  newValue?: any
}) {
  await supabase.from('audit_logs').insert({
    actor_id: params.actorId,
    actor_name: params.actorName,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    previous_value: params.previousValue ?? null,
    new_value: params.newValue ?? null,
  })
}