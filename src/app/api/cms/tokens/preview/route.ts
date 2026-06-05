import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { resolveTokenConfig } from "@/lib/content-tokens/resolve"

const previewSchema = z.object({
  collection: z.string(),
  mode: z.string(),
  config: z.record(z.string(), z.unknown()).default({}),
})

/** Resolve an unsaved token config so the wizard can show a live preview. Coach-only. */
export async function POST(request: Request) {
  try {
    await requireRole("coach")
    const { collection, mode, config } = previewSchema.parse(await request.json())
    const supabase = await createClient()
    const payload = await resolveTokenConfig(collection, mode, config, { audience: "member", supabase })
    return NextResponse.json(payload)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
