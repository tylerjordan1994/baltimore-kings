import { createClient } from '@/lib/supabase/server'
import { type UserRole } from '@/types/database'

const ROLE_HIERARCHY: Record<UserRole, number> = {
  pending: 0,
  player: 1,
  coach: 2,
  superadmin: 3,
}

export async function requireRole(minimumRole: UserRole) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Profile not found')
  }

  if (ROLE_HIERARCHY[profile.role as UserRole] < ROLE_HIERARCHY[minimumRole]) {
    throw new Error('Insufficient permissions')
  }

  return { user, profile }
}

export async function getSessionProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}
