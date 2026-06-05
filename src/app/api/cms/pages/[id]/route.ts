import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { stripResolved, type PuckData } from "@/lib/content-tokens/hydrate"

const saveSchema = z.object({
  puck_data: z.record(z.string(), z.unknown()),
  title: z.string().min(1).max(200).optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
})

/** Save draft. Strips any _resolved data so only bindings persist (§5.5). */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await requireRole("coach")
    const { id } = await params
    const body = saveSchema.parse(await request.json())
    const supabase = await createClient()

    const clean = stripResolved(body.puck_data as PuckData)
    const { error } = await supabase
      .from("pages")
      .update({
        puck_data: clean,
        ...(body.title ? { title: body.title } : {}),
        ...(body.seo_title !== undefined ? { seo_title: body.seo_title } : {}),
        ...(body.seo_description !== undefined ? { seo_description: body.seo_description } : {}),
        updated_by: profile.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
