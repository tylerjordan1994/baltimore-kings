import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

const createSchema = z.object({
  menu_key: z.string().refine((v) => v === "primary" || v === "footer" || v.startsWith("mega_"), "primary|footer|mega_*"),
  label: z.string().min(1).max(120),
  link_type: z.enum(["page", "url", "group"]).default("page"),
  page_id: z.string().uuid().nullable().optional(),
  external_url: z.string().nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  is_cta: z.boolean().optional(),
  visibility: z.enum(["public", "members_only"]).optional(),
  order_index: z.number().int().optional(),
})

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), order_index: z.number().int(), parent_id: z.string().uuid().nullable() })),
})

function status(e: unknown) {
  const msg = e instanceof Error ? e.message : "error"
  return { msg, code: msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400 }
}

export async function POST(request: Request) {
  try {
    await requireRole("coach")
    const body = createSchema.parse(await request.json())
    const supabase = await createClient()
    const { data, error } = await supabase.from("nav_items").insert(body).select("id").single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    const { msg, code } = status(e)
    return NextResponse.json({ error: msg }, { status: code })
  }
}

/** Batch reorder / re-parent after a drag. */
export async function PUT(request: Request) {
  try {
    await requireRole("coach")
    const { items } = reorderSchema.parse(await request.json())
    const supabase = await createClient()
    await Promise.all(
      items.map((it) => supabase.from("nav_items").update({ order_index: it.order_index, parent_id: it.parent_id }).eq("id", it.id)),
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    const { msg, code } = status(e)
    return NextResponse.json({ error: msg }, { status: code })
  }
}
