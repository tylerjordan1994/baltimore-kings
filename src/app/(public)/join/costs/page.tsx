import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Costs | Baltimore Kings",
  description: "What it costs to play with the Baltimore Kings. No club dues — just court rental split among players.",
}

export default function CostsPage() {
  return (
    <>
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            What It Costs
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            No hidden fees. We keep it simple.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* No dues */}
            <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold text-ink">Club Dues</h2>
                <span className="text-sm font-medium text-accent">$0</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                No annual dues, no membership fees. The club is sponsor-funded. You do not pay to be a member.
              </p>
            </div>

            {/* Court rental */}
            <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold text-ink">Court Rental (per practice)</h2>
                <span className="text-sm font-medium text-accent">Split among attendees</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                We rent court time for practices. The cost is split evenly among the players who show up that session. More players = cheaper per person.
              </p>
            </div>

            {/* Gear */}
            <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold text-ink">Gear</h2>
                <span className="text-sm font-medium text-accent">Player-provided</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                All-black kit. Players provide their own — black shirt, black shorts, black socks, flat-sole futsal shoes (non-marking), shin guards.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
            <p className="text-sm font-semibold text-ink">That is it.</p>
            <p className="mt-1 text-sm text-ink/80">
              No tournament fees, no ref fees, no surprise invoices. Court rental split is the only recurring cost.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
