import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/, "lowercase, hyphen/slash separated"),
})

const RESERVED = /^(app|api|auth|sign-in|sign-up|editor)(\/|$)/

export async function POST(request: Request) {
  try {
    const { profile } = await requireRole("coach")
    const { title, slug } = createSchema.parse(await request.json())
    if (RESERVED.test(slug)) {
      return NextResponse.json({ error: "slug shadows a reserved route" }, { status: 400 })
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("pages")
      .insert({ title, slug, status: "draft", visibility: "public", created_by: profile.id, updated_by: profile.id })
      .select("id")
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ id: (data as { id: string }).id })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
