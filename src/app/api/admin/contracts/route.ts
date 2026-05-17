import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

const createContractSchema = z.object({
  action: z.literal('create_contract'),
  title: z.string().min(1),
  body_markdown: z.string().min(1),
  kind: z.enum(['player_agreement', 'coach_agreement', 'tryout_waiver', 'tournament_release', 'code_of_conduct', 'other']),
  applies_to: z.enum(['individual', 'team', 'all_active']),
  team_id: z.string().uuid().nullable().optional(),
  expiration_date: z.string().nullable().optional(),
})

const assignSchema = z.object({
  action: z.literal('assign'),
  contract_id: z.string().uuid(),
  applies_to: z.enum(['individual', 'team', 'all_active']),
  profile_id: z.string().uuid().optional(),
  team_id: z.string().uuid().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole('coach')
    const body = await request.json()
    const supabase = await createClient()

    if (body.action === 'create_contract') {
      const data = createContractSchema.parse(body)

      const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
          title: data.title,
          body_markdown: data.body_markdown,
          kind: data.kind,
          applies_to: data.applies_to,
          team_id: data.team_id || null,
          effective_date: new Date().toISOString().split('T')[0],
          expiration_date: data.expiration_date || null,
          created_by: profile.id,
          is_active: true,
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAudit(profile.id, 'create_contract', 'contracts', contract.id, { title: data.title })
      return NextResponse.json({ success: true, data: contract })
    }

    if (body.action === 'assign') {
      const data = assignSchema.parse(body)

      let profileIds: string[] = []

      if (data.applies_to === 'individual' && data.profile_id) {
        profileIds = [data.profile_id]
      } else if (data.applies_to === 'team' && data.team_id) {
        const { data: members } = await supabase
          .from('team_members')
          .select('profile_id')
          .eq('team_id', data.team_id)
        profileIds = members?.map((m: any) => m.profile_id) || []
      } else if (data.applies_to === 'all_active') {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('status', 'active')
        profileIds = profiles?.map((p: any) => p.id) || []
      }

      if (profileIds.length === 0) {
        return NextResponse.json({ error: 'No profiles to assign' }, { status: 400 })
      }

      const assignments = profileIds.map((pid) => ({
        contract_id: data.contract_id,
        profile_id: pid,
        status: 'pending',
        assigned_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('contract_assignments')
        .insert(assignments)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAudit(profile.id, 'assign_contract', 'contract_assignments', data.contract_id, { count: profileIds.length })
      return NextResponse.json({ success: true, assigned: profileIds.length })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Unauthorized' || message === 'Insufficient permissions') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET() {
  try {
    await requireRole('coach')
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Unauthorized' || message === 'Insufficient permissions') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
