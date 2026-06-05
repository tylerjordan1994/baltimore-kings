import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe"

/** Create a Stripe Checkout session for one of the player's outstanding fee assignments. */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { assignment_id } = await request.json()
    if (!assignment_id) return NextResponse.json({ error: "assignment_id is required" }, { status: 400 })

    // The player may only pay their own outstanding assignment (RLS also enforces ownership).
    const { data: assignment } = await supabase
      .from("fee_assignments")
      .select("id, status, profile_id, fee_items(title, amount_cents, currency)")
      .eq("id", assignment_id)
      .eq("profile_id", user.id)
      .eq("status", "outstanding")
      .maybeSingle()

    const a = assignment as { id: string; fee_items: { title: string; amount_cents: number; currency: string } | null } | null
    if (!a || !a.fee_items) return NextResponse.json({ error: "Assignment not found or not payable" }, { status: 404 })

    const origin = request.headers.get("origin") ?? ""
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: a.fee_items.currency || "usd",
          product_data: { name: a.fee_items.title },
          unit_amount: a.fee_items.amount_cents,
        },
        quantity: 1,
      }],
      metadata: { fee_assignment_id: a.id, profile_id: user.id },
      success_url: `${origin}/project/football-team/app/fees?success=true`,
      cancel_url: `${origin}/project/football-team/app/fees?canceled=true`,
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
