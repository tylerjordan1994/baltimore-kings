import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { revalidateContent } from "@/lib/content-tokens/cache"

const schema = z.object({
  name: z.string().min(1).max(160),
  logo_url: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  tier: z.string().default("gold"),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  order_index: z.number().int().default(0),
})

export async function POST(request: Request) {
  try {
    await requireRole("coach")
    const body = schema.parse(await request.json())
    const supabase = await createClient()
    const { data, error } = await supabase.from("sponsors").insert(body).select("id").single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    revalidateContent("sponsors")
    return NextResponse.json(data)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
