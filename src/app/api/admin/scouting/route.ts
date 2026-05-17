import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

const createSchema = z.object({
  action: z.literal('create'),
  full_name: z.string().min(1),
  contact: z.string().nullable().optional(),
  current_team: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  scouted_at: z.string().nullable().optional(),
  event: z.string().nullable().optional(),
  assessment: z.string().nullable().optional(),
  priority: z.enum(['watch', 'target', 'actively_recruiting', 'signed', 'passed']).default('watch'),
})

const updatePrioritySchema = z.object({
  action: z.literal('update_priority'),
  id: z.string().uuid(),
  priority: z.enum(['watch', 'target', 'actively_recruiting', 'signed', 'passed']),
})

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole('coach')
    const body = await request.json()
    const supabase = await createClient()

    if (body.action === 'create') {
      const data = createSchema.parse(body)

      const { data: prospect, error } = await supabase
        .from('prospects')
        .insert({
          full_name: data.full_name,
          contact: data.contact || null,
          current_team: data.current_team || null,
          position: data.position || null,
          scouted_at: data.scouted_at || null,
          scouted_by: profile.id,
          event: data.event || null,
          assessment: data.assessment || null,
          priority: data.priority,
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAudit(profile.id, 'create_prospect', 'prospects', prospect.id, { full_name: data.full_name })
      return NextResponse.json({ success: true, data: prospect })
    }

    if (body.action === 'update_priority') {
      const data = updatePrioritySchema.parse(body)

      const { error } = await supabase
        .from('prospects')
        .update({ priority: data.priority })
        .eq('id', data.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAudit(profile.id, 'update_prospect_priority', 'prospects', data.id, { priority: data.priority })
      return NextResponse.json({ success: true })
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
      .from('prospects')
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
