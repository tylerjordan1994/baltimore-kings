import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const supabase = await createClient()

    const { error } = await supabase
      .from('newsletter_signups')
      .insert({ email, audience: 'general' })

    if (error) {
      // Handle duplicate
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already subscribed' })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
