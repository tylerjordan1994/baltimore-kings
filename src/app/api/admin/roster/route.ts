import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

const addPlayerSchema = z.object({
  teamId: z.string().uuid(),
  profileId: z.string().uuid(),
  rosterPosition: z.enum(['starter', 'sub', 'reserve']).default('reserve'),
  jerseyNumberForTeam: z.number().nullable().optional(),
})

const removePlayerSchema = z.object({
  teamMemberId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole('coach')
    const body = await request.json()
    const { teamId, profileId, rosterPosition, jerseyNumberForTeam } =
      addPlayerSchema.parse(body)

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        profile_id: profileId,
        roster_position: rosterPosition,
        jersey_number_for_team: jerseyNumberForTeam ?? null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit(profile.id, 'add_player_to_team', 'team_members', data.id, {
      teamId,
      profileId,
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Unauthorized' || message === 'Insufficient permissions') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { profile } = await requireRole('coach')
    const body = await request.json()
    const { teamMemberId } = removePlayerSchema.parse(body)

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('team_members')
      .select('team_id, profile_id')
      .eq('id', teamMemberId)
      .single()

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', teamMemberId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit(
      profile.id,
      'remove_player_from_team',
      'team_members',
      teamMemberId,
      existing ? { teamId: existing.team_id, profileId: existing.profile_id } : undefined
    )

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Unauthorized' || message === 'Insufficient permissions') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
