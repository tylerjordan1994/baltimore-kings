import { NextResponse } from "next/server"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

/** Coach-only: find the Puck page id for a public slug (for the frontend admin bar's Edit link). */
export async function GET(request: Request) {
  try {
    await requireRole("coach")
    const slug = new URL(request.url).searchParams.get("slug") ?? ""
    const supabase = await createClient()
    const q = supabase.from("pages").select("id, slug, status")
    const { data } = slug === "" ? await q.eq("is_home", true).maybeSingle() : await q.eq("slug", slug).maybeSingle()
    if (!data) return NextResponse.json({ page: null })
    return NextResponse.json({ page: data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 403 })
  }
}
