import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe"

/** Player-initiated payment to the club (e.g. a practice fee) via Stripe Checkout. */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { amount_cents, note } = await request.json()
    const cents = Math.round(Number(amount_cents))
    if (!cents || cents < 100) return NextResponse.json({ error: "Enter an amount of at least $1." }, { status: 400 })

    const origin = request.headers.get("origin") ?? ""
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: note ? `Payment — ${String(note).slice(0, 80)}` : "Payment to Baltimore Kings" },
          unit_amount: cents,
        },
        quantity: 1,
      }],
      metadata: { player_payment: "1", profile_id: user.id, note: String(note ?? "").slice(0, 120) },
      success_url: `${origin}/project/football-team/app/payments?success=true`,
      cancel_url: `${origin}/project/football-team/app/payments?canceled=true`,
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
