import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  event_date: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  price_cents: z.number().int().min(0),
  capacity: z.number().int().min(0).nullable().optional(),
  image_url: z.string().nullable().optional(),
  is_published: z.boolean().default(false),
})

const updateSchema = createSchema.partial().extend({
  id: z.string().uuid(),
})

function errorResponse(e: unknown) {
  const message = e instanceof Error ? e.message : "Unknown error"
  const status =
    message === "Unauthorized" || message === "Insufficient permissions"
      ? 403
      : 400
  return NextResponse.json({ error: message }, { status })
}

export async function GET() {
  try {
    await requireRole("coach")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("ticketed_events")
      .select("*")
      .order("event_date", { ascending: true })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (e) {
    return errorResponse(e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole("coach")
    const body = createSchema.parse(await request.json())
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("ticketed_events")
      .insert({ ...body, created_by: profile.id })
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return errorResponse(e)
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireRole("coach")
    const { id, ...updates } = updateSchema.parse(await request.json())
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("ticketed_events")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return errorResponse(e)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole("coach")
    const { id } = z
      .object({ id: z.string().uuid() })
      .parse(await request.json())
    const supabase = await createClient()
    const { error } = await supabase
      .from("ticketed_events")
      .delete()
      .eq("id", id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return errorResponse(e)
  }
}
