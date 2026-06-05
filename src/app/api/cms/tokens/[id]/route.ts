import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  key: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
})

function status(e: unknown) {
  const msg = e instanceof Error ? e.message : "error"
  return { msg, code: msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400 }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("coach")
    const { id } = await params
    const body = updateSchema.parse(await request.json())
    const supabase = await createClient()
    const { error } = await supabase
      .from("content_tokens")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const { msg, code } = status(e)
    return NextResponse.json({ error: msg }, { status: code })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("coach")
    const { id } = await params
    const supabase = await createClient()
    const { error } = await supabase.from("content_tokens").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const { msg, code } = status(e)
    return NextResponse.json({ error: msg }, { status: code })
  }
}
