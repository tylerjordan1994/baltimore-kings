import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ status: z.enum(["outstanding", "paid", "waived"]) })

/** Coach action: waive / re-open an assignment. (Stripe flips to 'paid' via webhook.) */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("coach")
    const { id } = await params
    const { status } = schema.parse(await request.json())
    const supabase = await createClient()
    const { error } = await supabase.from("fee_assignments").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
