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
      {/* Hero with image */}
      <section className="relative overflow-hidden bg-court py-28 sm:py-36">
        <img
          src="/project/football-team/photos/futsal-action.jpg"
          alt="Kings in action"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Why the Kings
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            There are rec leagues. There are college clubs. There are adult leagues that play once a week and call it competitive. This is not that.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-12 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-white p-6"
              >
                <h2 className="font-heading text-lg font-semibold text-accent">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo evidence section */}
      <section className="bg-paper py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <img
              src="/project/football-team/photos/masl3-huddle.jpg"
              alt="Team huddle"
              className="h-48 w-full rounded-xl object-cover sm:h-64"
            />
            <img
              src="/project/football-team/photos/player-kick.jpg"
              alt="Player in action"
              className="h-48 w-full rounded-xl object-cover sm:h-64"
            />
            <img
              src="/project/football-team/photos/masl3-team.jpg"
              alt="MASL3 team"
              className="h-48 w-full rounded-xl object-cover sm:h-64"
            />
          </div>
        </div>
      </section>
    </>
  )
}
