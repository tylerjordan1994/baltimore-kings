import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

const createSchema = z.object({
  action: z.literal('create'),
  profile_id: z.string().uuid(),
  period: z.string().nullable().optional(),
  technical_rating: z.number().min(1).max(5),
  tactical_rating: z.number().min(1).max(5),
  physical_rating: z.number().min(1).max(5),
  mental_rating: z.number().min(1).max(5),
  strengths: z.string().nullable().optional(),
  areas_for_growth: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_shared_with_player: z.boolean().default(false),
})

const toggleShareSchema = z.object({
  action: z.literal('toggle_share'),
  id: z.string().uuid(),
  is_shared_with_player: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole('coach')
    const body = await request.json()
    const supabase = await createClient()

    if (body.action === 'create') {
      const data = createSchema.parse(body)

      const { data: evaluation, error } = await supabase
        .from('evaluations')
        .insert({
          profile_id: data.profile_id,
          evaluator_id: profile.id,
          evaluation_date: new Date().toISOString().split('T')[0],
          period: data.period || null,
          technical_rating: data.technical_rating,
          tactical_rating: data.tactical_rating,
          physical_rating: data.physical_rating,
          mental_rating: data.mental_rating,
          strengths: data.strengths || null,
          areas_for_growth: data.areas_for_growth || null,
          notes: data.notes || null,
          is_shared_with_player: data.is_shared_with_player,
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAudit(profile.id, 'create_evaluation', 'evaluations', evaluation.id, { profile_id: data.profile_id })
      return NextResponse.json({ success: true, data: evaluation })
    }

    if (body.action === 'toggle_share') {
      const data = toggleShareSchema.parse(body)

      const { error } = await supabase
        .from('evaluations')
        .update({ is_shared_with_player: data.is_shared_with_player })
        .eq('id', data.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAudit(profile.id, 'toggle_evaluation_share', 'evaluations', data.id)
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
      .from('evaluations')
      .select('*, profiles:profile_id(full_name)')
      .order('evaluation_date', { ascending: false })

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
