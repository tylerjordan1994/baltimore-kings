import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServiceClient } from "@/lib/supabase/server"

function getStripeInstance() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
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
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const feeItemId = session.metadata?.fee_item_id
    const profileId = session.metadata?.profile_id

    if (feeItemId && profileId) {
      const supabase = await createServiceClient()

      // Create payment record
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

      // Mark fee as paid
      await supabase
        .from("fee_items")
        .update({
          is_paid: true,
          payment_id: payment?.id ?? null,
        })
        .eq("id", feeItemId)
    }
  }

  return NextResponse.json({ received: true })
}
