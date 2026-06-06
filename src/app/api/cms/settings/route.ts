import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { revalidateContent } from "@/lib/content-tokens/cache"

const schema = z.object({
  founded_year: z.number().int().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  default_og_image_url: z.string().nullable().optional(),
  public_theme: z.enum(["light", "dark"]).optional(),
  dashboard_theme: z.enum(["light", "dark"]).optional(),
  social_handles: z.record(z.string(), z.string()).optional(),
})

export async function PUT(request: Request) {
  try {
    await requireRole("coach")
    const body = schema.parse(await request.json())
    const supabase = await createClient()
    const { error } = await supabase
      .from("site_settings")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", true)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    revalidateContent("site_settings") // refresh value tokens like [club-founded-year]
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
