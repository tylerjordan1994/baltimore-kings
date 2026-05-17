import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"
import { TicketsBrowser } from "./tickets-browser"

// basePath handled by next.config.ts

export const metadata = {
  title: "Tickets | Baltimore Kings",
  description: "Buy tickets to Baltimore Kings games and events.",
}

export default async function TicketsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("ticketed_events")
    .select("*")
    .eq("is_published", true)
    .order("event_date", { ascending: true })

  const events = (data as Tables<"ticketed_events">[]) ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">
          Game Day
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-ink">
          Tickets
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Secure your seat for Baltimore Kings games and events. Tickets are
          purchased securely through Stripe — you&apos;ll receive a unique
          ticket code on checkout.
        </p>
      </div>

      <TicketsBrowser events={events} />
    </div>
  )
}
