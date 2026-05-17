import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Why the Kings | Baltimore Kings",
  description: "League 1 Futsal founding club. PRO-SA founding club. MASL3 representation. A futsal-first identity with a real pathway.",
}

const differentiators = [
  {
    title: "League 1 Futsal Founding Club",
    description: "We helped build the top futsal league in the United States. This is the highest level of competitive adult futsal on the East Coast.",
  },
  {
    title: "PRO-SA Founding Club",
    description: "Professional standards, amateur heart. We co-founded PRO-SA to create a legitimate structure for competitive adult soccer.",
  },
  {
    title: "MASL3 Representation",
    description: "Arena soccer at the third division of the Major Arena Soccer League. Real games, real refs, real stakes.",
  },
  {
    title: "Pathway to MASL2",
    description: "The Salisbury Steaks compete in MASL2. Kings players who earn it move up. This is a connected system, not a dead end.",
  },
  {
    title: "Professional Coaching",
    description: "Coaches with playing history, tactical knowledge, and a development plan. Not volunteers running pickup.",
  },
  {
    title: "Futsal-First Identity",
    description: "We are a futsal club that also plays arena. The small-sided game is the foundation. Technical development happens here.",
  },
]

export default function WhyKingsPage() {
  return (
    <>
      <section className="bg-[#0a0a0a] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Why the Kings
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            There are rec leagues. There are college clubs. There are adult leagues that play once a week and call it competitive. This is not that.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0a0a] pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <h2 className="font-heading text-lg font-semibold text-gold">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm text-white/60">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
