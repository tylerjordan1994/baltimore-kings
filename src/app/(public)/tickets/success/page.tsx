import { TicketSuccess } from "./ticket-success"

// basePath handled by next.config.ts

export const metadata = {
  title: "Ticket Confirmed | Baltimore Kings",
}

export default async function TicketSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <TicketSuccess sessionId={session_id ?? null} />
    </div>
  )
}
