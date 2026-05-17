import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

// basePath handled by next.config.ts
const BASE_PATH = "/project/football-team"

const checkoutSchema = z.object({
  ticketed_event_id: z.string().uuid(),
  purchaser_name: z.string().min(1),
  purchaser_email: z.string().email(),
  quantity: z.number().int().min(1).max(20),
})

export async function POST(request: NextRequest) {
  try {
    const body = checkoutSchema.parse(await request.json())
    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from("ticketed_events")
      .select("*")
      .eq("id", body.ticketed_event_id)
      .eq("is_published", true)
      .single()

    if (error || !event) {
      return NextResponse.json(
        { error: "Event not found or not on sale" },
        { status: 404 }
      )
    }

    const origin = request.headers.get("origin") ?? ""
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: body.purchaser_email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.title,
              description: event.venue ?? undefined,
            },
            unit_amount: event.price_cents,
          },
          quantity: body.quantity,
        },
      ],
      metadata: {
        ticketed_event_id: event.id,
        purchaser_name: body.purchaser_name,
        purchaser_email: body.purchaser_email,
        quantity: String(body.quantity),
      },
      success_url: `${origin}${BASE_PATH}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${BASE_PATH}/tickets?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
