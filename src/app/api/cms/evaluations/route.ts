import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({
  profile_id: z.string().uuid(),
  template_id: z.string().uuid().nullable().optional(),
  team_id: z.string().uuid().nullable().optional(),
  season: z.string().nullable().optional(),
  scores: z.record(z.string(), z.unknown()).default({}),
  summary_note: z.string().nullable().optional(),
  visibility: z.enum(["coach_only", "shared"]).default("coach_only"),
})

export async function POST(request: Request) {
  try {
    const { profile } = await requireRole("coach")
    const body = schema.parse(await request.json())
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("player_evaluations")
      .insert({ ...body, evaluator_id: profile.id })
      .select("id")
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
