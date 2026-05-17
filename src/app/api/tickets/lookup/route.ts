import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

/** Public lookup of a purchased ticket by Stripe checkout session id. */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data: ticket } = await supabase
    .from("tickets")
    .select("ticket_code, quantity, purchaser_name, ticketed_event_id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle()

  if (!ticket) {
    // Webhook may not have landed yet — caller should retry.
    return NextResponse.json({ data: null })
  }

  const { data: event } = await supabase
    .from("ticketed_events")
    .select("title, event_date, venue")
    .eq("id", ticket.ticketed_event_id)
    .single()

  return NextResponse.json({ data: { ticket, event } })
}
