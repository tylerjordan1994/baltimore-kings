import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

const createMediaSchema = z.object({
  url: z.string().url(),
  kind: z.enum(['photo', 'video']),
  caption: z.string().nullable().optional(),
  team_id: z.string().uuid().nullable().optional(),
  taken_at: z.string().nullable().optional(),
})

const deleteMediaSchema = z.object({
  id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole('coach')
    const body = await request.json()
    const data = createMediaSchema.parse(body)

    const supabase = await createClient()

    const { data: media, error } = await supabase
      .from('media_items')
      .insert({
        url: data.url,
        kind: data.kind,
        caption: data.caption ?? null,
        team_id: data.team_id ?? null,
        taken_at: data.taken_at ?? null,
        uploaded_by: profile.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit(profile.id, 'upload_media', 'media', media.id)

    return NextResponse.json({ success: true, data: media })
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
    const { id } = deleteMediaSchema.parse(body)

    const supabase = await createClient()

    const { error } = await supabase
      .from('media_items')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit(profile.id, 'delete_media', 'media', id)

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Unauthorized' || message === 'Insufficient permissions') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
