import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServiceClient } from "@/lib/supabase/server"

function getStripeInstance() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

/** Generate a human-friendly unique ticket code, e.g. BK-7K2QX9. */
function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `BK-${code}`
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  const stripe = getStripeInstance()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown"
    console.error("Webhook signature verification failed:", message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = await createServiceClient()

    const ticketedEventId = session.metadata?.ticketed_event_id
    const feeItemId = session.metadata?.fee_item_id
    const profileId = session.metadata?.profile_id

    // Ticket purchase
    if (ticketedEventId) {
      await supabase.from("tickets").insert({
        ticketed_event_id: ticketedEventId,
        purchaser_name: session.metadata?.purchaser_name ?? null,
        purchaser_email:
          session.customer_email ??
          session.metadata?.purchaser_email ??
          null,
        quantity: Number(session.metadata?.quantity ?? 1),
        amount_cents: session.amount_total ?? 0,
        stripe_session_id: session.id,
        ticket_code: generateTicketCode(),
        status: "valid",
      })
    }

    // Membership / dues fee payment
    if (feeItemId && profileId) {
      const { data: payment } = await supabase
        .from("payments")
        .insert({
          profile_id: profileId,
          stripe_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          amount_cents: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          purpose: "dues",
          description: `Payment for fee ${feeItemId}`,
          status: "completed",
          paid_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      await supabase
        .from("fee_items")
        .update({ is_paid: true, payment_id: payment?.id ?? null })
        .eq("id", feeItemId)
    }
  }

  return NextResponse.json({ received: true })
}
