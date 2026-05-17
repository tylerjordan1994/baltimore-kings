import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

const createFocusAreaSchema = z.object({
  action: z.literal('create_focus_area'),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.enum(['technical', 'tactical', 'physical', 'mental']),
  default_for_positions: z.array(z.string()).default([]),
})

const createAssignmentSchema = z.object({
  action: z.literal('create_assignment'),
  focus_area_id: z.string().uuid(),
  assigned_to_team_id: z.string().uuid().optional(),
  profile_ids: z.array(z.string().uuid()).optional(),
  notes_markdown: z.string().nullable().optional(),
  due_by: z.string().nullable().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  attached_youtube_url: z.string().nullable().optional(),
})

const confirmSchema = z.object({
  action: z.literal('confirm_completion'),
  progress_id: z.string().uuid(),
})

const sendBackSchema = z.object({
  action: z.literal('send_back'),
  progress_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole('coach')
    const body = await request.json()
    const supabase = await createClient()

    if (body.action === 'create_focus_area') {
      const data = createFocusAreaSchema.parse(body)

      const { data: fa, error } = await supabase
        .from('focus_areas')
        .insert({
          name: data.name,
          description: data.description || null,
          category: data.category,
          default_for_positions: data.default_for_positions,
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAudit(profile.id, 'create_focus_area', 'focus_areas', fa.id, { name: data.name })
      return NextResponse.json({ success: true, data: fa })
    }

    if (body.action === 'create_assignment') {
      const data = createAssignmentSchema.parse(body)

      if (data.assigned_to_team_id) {
        // Assign to team
        const { data: assignment, error } = await supabase
          .from('training_assignments')
          .insert({
            focus_area_id: data.focus_area_id,
            assigned_to_team_id: data.assigned_to_team_id,
            assigned_by: profile.id,
            notes_markdown: data.notes_markdown || null,
            due_by: data.due_by || null,
            priority: data.priority,
            attached_youtube_url: data.attached_youtube_url || null,
            is_auto_assigned: false,
          })
          .select()
          .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await logAudit(profile.id, 'create_training_assignment', 'training_assignments', assignment.id)
        return NextResponse.json({ success: true, data: assignment })
      }

      if (data.profile_ids && data.profile_ids.length > 0) {
        // Bulk assign to players
        const assignments = data.profile_ids.map((pid) => ({
          focus_area_id: data.focus_area_id,
          assigned_to_profile_id: pid,
          assigned_by: profile.id,
          notes_markdown: data.notes_markdown || null,
          due_by: data.due_by || null,
          priority: data.priority,
          attached_youtube_url: data.attached_youtube_url || null,
          is_auto_assigned: false,
        }))

        const { error } = await supabase
          .from('training_assignments')
          .insert(assignments)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        await logAudit(profile.id, 'bulk_create_training_assignments', 'training_assignments', undefined, { count: assignments.length })
        return NextResponse.json({ success: true, assigned: assignments.length })
      }

      return NextResponse.json({ error: 'No assignment target specified' }, { status: 400 })
    }

    if (body.action === 'confirm_completion') {
      const data = confirmSchema.parse(body)

      const { error } = await supabase
        .from('training_progress')
        .update({ status: 'coach_confirmed', coach_notes: null, updated_at: new Date().toISOString() })
        .eq('id', data.progress_id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAudit(profile.id, 'confirm_training_completion', 'training_progress', data.progress_id)
      return NextResponse.json({ success: true })
    }

    if (body.action === 'send_back') {
      const data = sendBackSchema.parse(body)

      const { error } = await supabase
        .from('training_progress')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', data.progress_id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAudit(profile.id, 'send_back_training', 'training_progress', data.progress_id)
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
      .from('training_assignments')
      .select('*, focus_areas(*), profiles:assigned_to_profile_id(full_name)')
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
