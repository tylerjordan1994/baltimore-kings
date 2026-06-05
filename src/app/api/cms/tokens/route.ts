import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

const COLLECTIONS = ["players", "events", "sponsors", "achievements", "media", "social", "merch", "learn", "teams", "value"] as const

const tokenSchema = z.object({
  key: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case"),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  collection: z.enum(COLLECTIONS),
  mode: z.enum(["dynamic", "curated", "value"]),
  config: z.record(z.string(), z.unknown()).default({}),
})

export async function POST(request: Request) {
  try {
    const { profile } = await requireRole("coach")
    const body = tokenSchema.parse(await request.json())
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("content_tokens")
      .insert({ ...body, created_by: profile.id })
      .select("id, key")
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
