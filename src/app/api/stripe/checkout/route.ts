import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const basePath = "/project/football-team"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fee_item_id } = await request.json()

    if (!fee_item_id) {
      return NextResponse.json(
        { error: "fee_item_id is required" },
        { status: 400 }
      )
    }

    // Verify user owns this fee
    const { data: fee, error: feeError } = await supabase
      .from("fee_items")
      .select("*")
      .eq("id", fee_item_id)
      .eq("profile_id", user.id)
      .eq("is_paid", false)
      .single()

    if (feeError || !fee) {
      return NextResponse.json(
        { error: "Fee item not found or already paid" },
        { status: 404 }
      )
    }

    const origin = request.headers.get("origin") ?? ""

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: fee.description,
            },
            unit_amount: fee.amount_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        fee_item_id: fee.id,
        profile_id: user.id,
      },
      success_url: `${origin}${basePath}/app/payments?success=true`,
      cancel_url: `${origin}${basePath}/app/payments?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: error.message ?? "Internal error" },
      { status: 500 }
    )
  }
}
