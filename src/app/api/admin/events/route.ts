import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

const createEventSchema = z.object({
  title: z.string().min(1),
  kind: z.enum(['practice', 'home_game', 'away_game', 'tryout', 'meeting', 'other']),
  starts_at: z.string(),
  ends_at: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  team_ids: z.array(z.string().uuid()).default([]),
  visibility: z.enum(['public', 'members_only']).default('public'),
  description: z.string().nullable().optional(),
  repeat_weeks: z.number().int().min(0).max(52).optional(),
})

const updateEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  kind: z.enum(['practice', 'home_game', 'away_game', 'tryout', 'meeting', 'other']).optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  team_ids: z.array(z.string().uuid()).optional(),
  visibility: z.enum(['public', 'members_only']).optional(),
  description: z.string().nullable().optional(),
})

const deleteEventSchema = z.object({
  id: z.string().uuid(),
})

export async function GET() {
  try {
    await requireRole('coach')
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('starts_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Unauthorized' || message === 'Insufficient permissions') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole('coach')
    const body = await request.json()
    const { repeat_weeks, ...eventData } = createEventSchema.parse(body)

    const supabase = await createClient()

    const events = []
    const baseStart = new Date(eventData.starts_at)
    const baseEnd = eventData.ends_at ? new Date(eventData.ends_at) : null
    const weeks = repeat_weeks || 1

    for (let i = 0; i < weeks; i++) {
      const startDate = new Date(baseStart)
      startDate.setDate(startDate.getDate() + i * 7)

      let endDate: string | null = null
      if (baseEnd) {
        const ed = new Date(baseEnd)
        ed.setDate(ed.getDate() + i * 7)
        endDate = ed.toISOString()
      }

      events.push({
        title: eventData.title,
        kind: eventData.kind,
        starts_at: startDate.toISOString(),
        ends_at: endDate,
        location: eventData.location ?? null,
        team_ids: eventData.team_ids,
        visibility: eventData.visibility,
        description: eventData.description ?? null,
        created_by: profile.id,
      })
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .insert(events)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit(profile.id, 'create_events', 'calendar_events', data?.[0]?.id, {
      count: events.length,
      title: eventData.title,
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

export async function PUT(request: NextRequest) {
  try {
    const { profile } = await requireRole('coach')
    const body = await request.json()
    const { id, ...updates } = updateEventSchema.parse(body)

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit(profile.id, 'update_event', 'calendar_events', id, updates)

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
    const { id } = deleteEventSchema.parse(body)

    const supabase = await createClient()

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit(profile.id, 'delete_event', 'calendar_events', id)

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Unauthorized' || message === 'Insufficient permissions') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
