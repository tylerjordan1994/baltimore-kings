import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Captures email-reminder signups for a public schedule event.
// Scope is intentionally limited to capturing signups. A future cron can read
// unreminded event_reminders rows for events in the next 24h and email via
// lib/resend.ts, then flip reminded = true.

const schema = z.object({
  event_id: z.string().uuid('Invalid event id'),
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, email } = schema.parse(body)

    const supabase = await createClient()

    // Upsert on the (event_id, email) unique constraint — re-subscribing is a no-op.
    const { error } = await supabase
      .from('event_reminders')
      .upsert(
        { event_id, email },
        { onConflict: 'event_id,email', ignoreDuplicates: true }
      )

    if (error) {
      // Duplicate is fine (already subscribed).
      if (error.code === '23505') {
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
