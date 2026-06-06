import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

const updateSchema = z.object({
  label: z.string().min(1).max(120).optional(),
  link_type: z.enum(["page", "url", "group"]).optional(),
  page_id: z.string().uuid().nullable().optional(),
  external_url: z.string().nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  is_cta: z.boolean().optional(),
  visibility: z.enum(["public", "members_only"]).optional(),
  is_active: z.boolean().optional(),
  feature_card_json: z.record(z.string(), z.unknown()).nullable().optional(),
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
    const { error } = await supabase.from("nav_items").update(body).eq("id", id)
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
    const { error } = await supabase.from("nav_items").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const { msg, code } = status(e)
    return NextResponse.json({ error: msg }, { status: code })
  }
}
