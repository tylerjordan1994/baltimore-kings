import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { revalidateContent } from "@/lib/content-tokens/cache"

const schema = z.object({
  name: z.string().min(1).max(160).optional(),
  logo_url: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  tier: z.string().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  order_index: z.number().int().optional(),
})

function status(e: unknown) {
  const msg = e instanceof Error ? e.message : "error"
  return { msg, code: msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400 }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("coach")
    const { id } = await params
    const body = schema.parse(await request.json())
    const supabase = await createClient()
    const { error } = await supabase.from("sponsors").update(body).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    revalidateContent("sponsors")
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
    const { error } = await supabase.from("sponsors").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    revalidateContent("sponsors")
    return NextResponse.json({ ok: true })
  } catch (e) {
    const { msg, code } = status(e)
    return NextResponse.json({ error: msg }, { status: code })
  }
}
