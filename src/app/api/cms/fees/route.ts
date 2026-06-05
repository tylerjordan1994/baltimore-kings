import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().nullable().optional(),
  amount_cents: z.number().int().positive(),
  purpose: z.enum(["ref_fee", "practice_fee", "dues", "other", "tournament_fee"]),
  applies_to: z.enum(["team", "players"]),
  team_id: z.string().uuid().nullable().optional(),
  profile_ids: z.array(z.string().uuid()).optional(),
})

/** Create a fee item (template) and generate outstanding assignments. */
export async function POST(request: Request) {
  try {
    const { profile } = await requireRole("coach")
    const body = schema.parse(await request.json())
    const supabase = await createClient()

    const { data: fee, error } = await supabase
      .from("fee_items")
      .insert({
        title: body.title,
        description: body.description ?? body.title,
        amount_cents: body.amount_cents,
        currency: "usd",
        purpose: body.purpose,
        applies_to: body.applies_to,
        team_id: body.team_id ?? null,
        is_active: true,
        created_by: profile.id,
      })
      .select("id")
      .single()
    if (error || !fee) return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 400 })
    const feeId = (fee as { id: string }).id

    // Resolve target profiles.
    let profileIds: string[] = []
    if (body.applies_to === "team" && body.team_id) {
      const { data: members } = await supabase.from("team_members").select("profile_id").eq("team_id", body.team_id).eq("is_active", true)
      profileIds = [...new Set(((members ?? []) as { profile_id: string }[]).map((m) => m.profile_id))]
    } else if (body.applies_to === "players") {
      profileIds = body.profile_ids ?? []
    }

    if (profileIds.length) {
      await supabase.from("fee_assignments").insert(
        profileIds.map((pid) => ({ fee_item_id: feeId, profile_id: pid, status: "outstanding" as const })),
      )
    }

    return NextResponse.json({ id: feeId, assigned: profileIds.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
