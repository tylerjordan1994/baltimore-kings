import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { stripResolved, type PuckData } from "@/lib/content-tokens/hydrate"
import { revalidatePagePath } from "@/lib/content-tokens/cache"

const publishSchema = z.object({ puck_data: z.record(z.string(), z.unknown()) })

/** Save + publish: snapshot a revision, flip to published, revalidate the path. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await requireRole("coach")
    const { id } = await params
    const { puck_data } = publishSchema.parse(await request.json())
    const clean = stripResolved(puck_data as PuckData)
    const supabase = await createClient()

    // Snapshot current state as a revision before overwriting.
    const { data: current } = await supabase.from("pages").select("slug, puck_data").eq("id", id).maybeSingle()
    if (current) {
      await supabase.from("page_revisions").insert({
        page_id: id,
        puck_data: (current as { puck_data: unknown }).puck_data,
        created_by: profile.id,
      })
    }

    const { error } = await supabase
      .from("pages")
      .update({
        puck_data: clean,
        status: "published",
        published_at: new Date().toISOString(),
        updated_by: profile.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const slug = (current as { slug: string } | null)?.slug
    if (slug) revalidatePagePath(slug)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
