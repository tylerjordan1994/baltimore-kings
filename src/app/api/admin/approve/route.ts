import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

const approveSchema = z.object({
  profileId: z.string().uuid(),
})

const rejectSchema = z.object({
  profileId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole('coach')
    const body = await request.json()
    const { profileId } = approveSchema.parse(body)

    const supabase = await createClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        role: 'player',
        status: 'active',
        also_plays: true,
        approved_at: new Date().toISOString(),
        approved_by: profile.id,
      })
      .eq('id', profileId)
      .eq('role', 'pending')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit(profile.id, 'approve_user', 'profiles', profileId, {
      role: 'player',
    })

    return NextResponse.json({ success: true })
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
    const { profileId } = rejectSchema.parse(body)

    const supabase = await createClient()

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)
      .eq('role', 'pending')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit(profile.id, 'reject_user', 'profiles', profileId)

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Unauthorized' || message === 'Insufficient permissions') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
