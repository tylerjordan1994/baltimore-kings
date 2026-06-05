import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { revalidatePagePath } from "@/lib/content-tokens/cache"

const schema = z.object({ action: z.enum(["publish", "unpublish", "duplicate", "set-home", "delete"]) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await requireRole("coach")
    const { id } = await params
    const { action } = schema.parse(await request.json())
    const supabase = await createClient()

    const { data: page } = await supabase.from("pages").select("*").eq("id", id).maybeSingle()
    if (!page) return NextResponse.json({ error: "not found" }, { status: 404 })
    const p = page as { slug: string; title: string; puck_data: unknown; status: string }

    if (action === "publish" || action === "unpublish") {
      const status = action === "publish" ? "published" : "draft"
      await supabase.from("pages").update({
        status, ...(action === "publish" ? { published_at: new Date().toISOString() } : {}),
        updated_by: profile.id, updated_at: new Date().toISOString(),
      }).eq("id", id)
      revalidatePagePath(p.slug)
      return NextResponse.json({ ok: true })
    }

    if (action === "set-home") {
      await supabase.from("pages").update({ is_home: false }).eq("is_home", true)
      await supabase.from("pages").update({ is_home: true, updated_by: profile.id }).eq("id", id)
      revalidatePagePath("")
      return NextResponse.json({ ok: true })
    }

    if (action === "duplicate") {
      // Find a free slug: <slug>-copy, -copy-2, ...
      const { data: existing } = await supabase.from("pages").select("slug").like("slug", `${p.slug}-copy%`)
      const taken = new Set(((existing ?? []) as { slug: string }[]).map((r) => r.slug))
      let slug = `${p.slug}-copy`
      let n = 1
      while (taken.has(slug)) { n++; slug = `${p.slug}-copy-${n}` }
      const { data: created, error } = await supabase.from("pages").insert({
        slug, title: `${p.title} (copy)`, puck_data: p.puck_data, status: "draft", visibility: "public",
        created_by: profile.id, updated_by: profile.id,
      }).select("id").single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ id: (created as { id: string }).id })
    }

    if (action === "delete") {
      await supabase.from("pages").delete().eq("id", id)
      revalidatePagePath(p.slug)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
