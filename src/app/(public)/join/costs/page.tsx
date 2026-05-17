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
      <section className="bg-[#0a0a0a] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            What It Costs
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            No hidden fees. Here is what you pay and what it covers.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0a0a] pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {costs.map((cost) => (
              <div
                key={cost.category}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                  <h2 className="font-heading text-lg font-semibold text-white">{cost.category}</h2>
                  <span className="text-sm font-medium text-gold">{cost.amount}</span>
                </div>
                <p className="mt-2 text-sm text-white/60">{cost.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/5 p-6 sm:p-8">
            <p className="text-sm text-white/80">
              Payment plans available — talk to a coach before the due date.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
