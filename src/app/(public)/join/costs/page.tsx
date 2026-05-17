import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Costs | Baltimore Kings",
  description: "Transparent pricing for Baltimore Kings membership. Annual dues, ref fees, tournament costs, and gear requirements.",
}

const costs = [
  {
    category: "Annual Dues",
    amount: "[NEEDS CONFIRMATION]",
    description: "Covers league registration, insurance, facility rental for practices and home games.",
  },
  {
    category: "Ref Fees (per home game)",
    amount: "[NEEDS CONFIRMATION]",
    description: "Split among the roster. Paid per home match to cover referee assignments.",
  },
  {
    category: "Tournament Entry",
    amount: "[NEEDS CONFIRMATION]",
    description: "Per tournament. We compete in 2-4 tournaments per season depending on the team.",
  },
  {
    category: "Travel Costs",
    amount: "[NEEDS CONFIRMATION]",
    description: "Away games and tournaments. Carpooling is common. Most travel is within the Mid-Atlantic.",
  },
  {
    category: "Gear Requirements",
    amount: "[NEEDS CONFIRMATION]",
    description: "Team jersey, futsal shoes (flat sole, non-marking), shin guards. Jersey provided with dues in most cases.",
  },
]

export default function CostsPage() {
  return (
    <>
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            What It Costs
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            No hidden fees. Here is what you pay and what it covers.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {costs.map((cost) => (
              <div
                key={cost.category}
                className="rounded-xl border border-border bg-white p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                  <h2 className="font-heading text-lg font-semibold text-ink">{cost.category}</h2>
                  <span className="text-sm font-medium text-accent">{cost.amount}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{cost.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
            <p className="text-sm text-ink/80">
              Payment plans available — talk to a coach before the due date.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
