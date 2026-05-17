import { createClient } from '@/lib/supabase/server'

export async function logAudit(
  actorId: string,
  action: string,
  targetTable?: string,
  targetId?: string,
  diff?: Record<string, unknown>
) {
  const supabase = await createClient()
  await supabase.from('audit_log').insert({
    actor_profile_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId,
    diff_json: diff,
  })
}
