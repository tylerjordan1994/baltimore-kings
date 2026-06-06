import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, ArrowRight } from "lucide-react"

// basePath handled by next.config.ts

export const metadata: Metadata = {
  title: "Affiliations | Baltimore Kings",
  description:
    "Baltimore Kings affiliations and league partnerships — Pro Soccer Alliance (League 1 Futsal), the MASL (Divisions 2 & 3), and the USA Futsal Federation.",
}

const affiliations = [
  {
    name: "Pro Soccer Alliance",
    shortName: "Pro-SA",
    category: "Sanctioning Body",
    tagline: "League 1 Futsal — premier sanctioned futsal in the United States",
    description:
      "The Pro Soccer Alliance is the governing and sanctioning body behind League 1 Futsal — the highest level of organized competitive futsal in the Mid-Atlantic and one of the premier futsal competitions in the country. Baltimore Kings are founding members of both the Pro-SA and League 1 Futsal, having helped build the infrastructure for legitimate adult competitive futsal from the ground up.",
    url: "http://www.prosocceralliance.com/",
    detail:
      "League 1 Futsal uses FIFA futsal rules, a low-bounce ball, and proper futsal court dimensions. Sanctioned competition, registered officials, and season standings. This is not recreational.",
    logoPlaceholder: "PRO-SA",
    accent: true,
  },
  {
    name: "MASL — Arena Soccer (Divisions 2 & 3)",
    shortName: "MASL",
    category: "Arena Soccer League",
    tagline: "The club competes in MASL2 and MASL3",
    description:
      "The Major Arena Soccer League is the arena soccer pyramid. The club competes across two of its divisions: a Kings side in MASL3 (drawn from both Kings 1 and Kings 2) and the Salisbury Steaks in MASL2. The Steaks are part of the club — a club squad, not an outside affiliate — and the top of our arena pathway. MASL1 sits above: the Baltimore Blast has scouted from this club before.",
    url: "https://www.masl3.com/",
    detail:
      "Arena soccer uses a larger court with boards, a standard indoor ball, and wall passes. MASL3 is played at GOALS Baltimore; the Steaks compete at MASL2.",
    logoPlaceholder: "MASL",
    accent: false,
  },
  {
    name: "USA Futsal Federation",
    shortName: "USA Futsal",
    category: "National Federation",
    tagline: "The Court — national training center for U.S. futsal",
    description:
      "The Court, opening June 15 beside The Soccer Factory in Forest Hill, MD, is the national training center of the USA Futsal Federation and the home base for the U.S. Men's international futsal team. The Kings' affiliation with this facility puts our players in the same building as the highest level of American futsal.",
    url: undefined,
    detail:
      "The Court is purpose-built for futsal and affiliated with The Soccer Factory (98 Industry Ln, Forest Hill, MD 21050).",
    logoPlaceholder: "USAF",
    accent: true,
  },
]

export default function AffiliationsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-paper py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
            Affiliations &amp; Partners
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Connected to the game at every level
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Baltimore Kings don't operate in isolation. We're a founding member of the Pro Soccer Alliance, field a Kings side in MASL3 and the Salisbury Steaks in MASL2 (both part of the club), and train at the USA Futsal Federation's national center — giving our players a clear ladder from competitive club play to professional indoor soccer.
          </p>
        </div>
      </section>

      {/* Affiliation cards */}
      <section className="bg-paper pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {affiliations.map((aff) => (
            <div
              key={aff.name}
              className={`overflow-hidden rounded-2xl border ${aff.accent ? "border-accent/30 bg-accent/5" : "border-border bg-white"}`}
            >
              <div className="grid gap-0 lg:grid-cols-3">
                {/* Logo block */}
                <div className={`flex items-center justify-center border-b border-border lg:border-b-0 lg:border-r p-10 ${aff.accent ? "bg-accent/10" : "bg-paper"}`}>
                  <div className={`flex h-28 w-28 items-center justify-center rounded-2xl border-2 ${aff.accent ? "border-accent/40 bg-white" : "border-border bg-paper"}`}>
                    <span className={`font-heading text-xl font-bold ${aff.accent ? "text-accent" : "text-brand"}`}>
                      {aff.logoPlaceholder}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="col-span-2 p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="inline-block rounded-full bg-paper px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border border-border">
                        {aff.category}
                      </span>
                      <h2 className="mt-3 font-heading text-2xl font-bold text-ink">
                        {aff.name}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-accent">{aff.tagline}</p>
                    </div>
                    {aff.url && (
                      <a
                        href={aff.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent/30 hover:text-accent"
                      >
                        Visit Website
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                    {aff.description}
                  </p>

                  <div className="mt-5 rounded-xl border border-border bg-paper p-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-ink">In practice: </span>
                      {aff.detail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How the ladder works */}
      <section className="border-t border-border bg-brand py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
              The Pathway
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From Kings to professional soccer
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">
              The Kings system is connected at every level. Joining our futsal program puts you on the same ladder as players who have gone on to compete professionally.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { step: "01", title: "Baltimore Kings", sub: "League 1 Futsal + MASL3" },
              { step: "02", title: "Salisbury Steaks", sub: "MASL2 Arena Soccer" },
              { step: "03", title: "MASL1", sub: "Professional Arena Soccer" },
            ].map((item, i) => (
              <div key={item.step} className="relative rounded-xl bg-white/10 p-6 text-center">
                {i < 2 && (
                  <div className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                    <ArrowRight className="h-4 w-4 text-accent" />
                  </div>
                )}
                <span className="font-heading text-3xl font-bold text-accent">{item.step}</span>
                <p className="mt-2 font-heading text-base font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-white/70">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/teams/pathway"
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-6 py-3 font-heading text-sm font-semibold text-accent transition-colors hover:bg-accent/10"
            >
              Learn more about the pathway
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
