import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { revalidatePagePath } from "@/lib/content-tokens/cache"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("coach")
    const { id } = await params
    const supabase = await createClient()
    const { data } = await supabase
      .from("page_revisions")
      .select("id, created_at")
      .eq("page_id", id)
      .order("created_at", { ascending: false })
      .limit(50)
    return NextResponse.json({ revisions: data ?? [] })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 403 })
  }
}

const restoreSchema = z.object({ revisionId: z.string().uuid() })

/** Restore a revision: snapshot current, then copy the revision's puck_data back. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await requireRole("coach")
    const { id } = await params
    const { revisionId } = restoreSchema.parse(await request.json())
    const supabase = await createClient()

    const { data: rev } = await supabase.from("page_revisions").select("puck_data").eq("id", revisionId).eq("page_id", id).maybeSingle()
    if (!rev) return NextResponse.json({ error: "revision not found" }, { status: 404 })

    const { data: current } = await supabase.from("pages").select("slug, puck_data").eq("id", id).maybeSingle()
    if (current) {
      await supabase.from("page_revisions").insert({ page_id: id, puck_data: (current as { puck_data: unknown }).puck_data, created_by: profile.id })
    }
    await supabase.from("pages").update({ puck_data: (rev as { puck_data: unknown }).puck_data, updated_by: profile.id, updated_at: new Date().toISOString() }).eq("id", id)
    if (current) revalidatePagePath((current as { slug: string }).slug)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
