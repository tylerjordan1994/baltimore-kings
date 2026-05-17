import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, MapPin, Calendar, Trophy, Shield } from "lucide-react"

// basePath handled by next.config.ts

export const metadata: Metadata = {
  title: "About the Club | Baltimore Kings",
  description:
    "Baltimore Kings is a futsal-first club in Baltimore, founded in 2012. Competing in Pro-SA League 1 Futsal and MASL3 arena soccer, affiliated with the Salisbury Steaks.",
}

const stats = [
  { value: "2012", label: "Founded" },
  { value: "3", label: "Competitive Teams" },
  { value: "League 1", label: "Futsal Division" },
  { value: "MASL3", label: "Arena Division" },
]

const venues = [
  {
    name: "Benfield Sports",
    role: "Futsal home court & training",
    address: "1031 Benfield Blvd, Millersville, MD 21108",
    icon: "court",
  },
  {
    name: "GOALS Baltimore",
    role: "MASL3 home arena",
    address: "6159 Edmondson Ave, Catonsville, MD 21228",
    icon: "arena",
  },
]

const teams = [
  {
    name: "Futsal Kings 1",
    description:
      "Our flagship futsal squad competes at the highest level of League 1 Futsal in the Mid-Atlantic region — fast, technical, tactically demanding.",
    href: "/teams/futsal-kings-1",
  },
  {
    name: "Futsal Kings 2",
    description:
      "The development side that bridges the gap between aspiring players and our first squad. Competitive season play with an eye on promotion.",
    href: "/teams/futsal-kings-2",
  },
  {
    name: "MASL3 Arena Soccer",
    description:
      "Baltimore Kings in the Major Arena Soccer League 3 — indoor arena soccer with boards, bigger court, and a direct pathway to MASL2 via the Salisbury Steaks.",
    href: "/teams/masl3",
  },
]

export default function ClubAboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-court">
        <img
          src="/project/football-team/photos/futsal-kings-combined.jpg"
          alt="Baltimore Kings futsal team"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <p className="mb-4 font-heading text-xs font-semibold uppercase tracking-widest text-accent">
            Baltimore, Maryland · Est. 2012
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Futsal-first.<br className="hidden sm:block" /> Baltimore built.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            The Baltimore Kings are a competitive futsal and arena soccer club rooted in the belief that the small-sided game produces better players, smarter teams, and a higher level of competition. We've been doing this since 2012.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/join/apply"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-heading text-sm font-semibold text-ink transition-colors hover:bg-accent/90"
            >
              Apply for Tryout
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/club/affiliations"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-heading text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Our Affiliations
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-brand">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="px-6 py-8 text-center">
                <div className="font-heading text-2xl font-bold text-accent sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-white/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Identity */}
      <section className="bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
                Our Mission
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Competition at every level. Development at every stage.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                The Baltimore Kings exist to provide serious adult players with a genuine competitive environment — structured seasons, professional-level coaching, and a clear pathway from recreational play to professional indoor soccer.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                We are not a recreational league. We are not a pick-up group. We are a club built around the idea that futsal makes you a better player, and that Baltimore deserves a team worth competing for.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                As founding members of the Pro Soccer Alliance and League 1 Futsal, we helped build the framework for competitive adult indoor soccer in the United States. That's not something we wear lightly — it means we hold ourselves to a higher standard in everything we do.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="/project/football-team/photos/futsal-action.jpg"
                alt="Kings in action on the futsal court"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="border-t border-border bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1 overflow-hidden rounded-2xl">
              <img
                src="/project/football-team/photos/player-light.jpg"
                alt="Baltimore Kings player"
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
                History
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Built from the ground up since 2012
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                The Baltimore Kings were founded in 2012 with a simple purpose: give competitive soccer players in Baltimore a real club to represent. Not just an adult league, but a genuine organization with coaching, structure, and ambition.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                From those early days, the Kings grew alongside the development of organized futsal in the region. When the Pro Soccer Alliance launched League 1 Futsal, Baltimore Kings were founding members — one of a small group of clubs that believed American futsal deserved a professional structure.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                The club added MASL3 arena soccer to its program, expanding the Kings' reach and connecting players to the broader ladder of American indoor soccer — including a direct affiliation with the Salisbury Steaks in MASL2.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-paper p-4">
                  <Calendar className="h-5 w-5 text-accent" />
                  <p className="mt-2 font-heading text-sm font-semibold text-ink">Founded 2012</p>
                  <p className="mt-1 text-xs text-muted-foreground">Over a decade of competitive futsal in Baltimore</p>
                </div>
                <div className="rounded-xl border border-border bg-paper p-4">
                  <Trophy className="h-5 w-5 text-accent" />
                  <p className="mt-2 font-heading text-sm font-semibold text-ink">MASL3 Playoff Hosts</p>
                  <p className="mt-1 text-xs text-muted-foreground">Hosted MASL3 playoffs in March 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
              Why Kings
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              What makes this club different
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              There are adult leagues across Baltimore. There are pick-up nights. There are teams that play and call it a club. Here's what we are that they aren't.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Shield className="h-5 w-5 text-accent" />,
                title: "Futsal-First Identity",
                body: "Futsal is not a training exercise. It is our primary game. The technical demands, the tactical education, and the identity of this club are built on the small-sided game.",
              },
              {
                icon: <Trophy className="h-5 w-5 text-accent" />,
                title: "Pro-SA Founding Club",
                body: "We co-founded the Pro Soccer Alliance to create legitimate, sanctioned competition for adult indoor soccer. League 1 Futsal is the result — and we helped build it.",
              },
              {
                icon: <ArrowRight className="h-5 w-5 text-accent" />,
                title: "A Real Pathway",
                body: "MASL3 connects to MASL2 through our affiliation with the Salisbury Steaks. Players who earn it can move up. This is a ladder, not a dead end.",
              },
              {
                icon: <Calendar className="h-5 w-5 text-accent" />,
                title: "Structured Seasons",
                body: "We run organized seasons with schedules, standings, and playoffs. Coaches have development plans. Every training session has a tactical objective.",
              },
              {
                icon: <MapPin className="h-5 w-5 text-accent" />,
                title: "Purpose-Built Venues",
                body: "Benfield Sports for futsal. GOALS Baltimore for arena. Both facilities are purpose-built for the sport — no gymnasiums, no compromises.",
              },
              {
                icon: <Shield className="h-5 w-5 text-accent" />,
                title: "Salisbury Steaks Affiliation",
                body: "Our MASL2 affiliate keeps a direct eye on Kings players. Top performers have a defined path to professional-level arena soccer.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-white p-6 transition-all hover:border-accent/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teams */}
      <section className="border-t border-border bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
            The Teams
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Three squads. One club.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Link
                key={team.name}
                href={team.href}
                className="group rounded-xl border border-border bg-paper p-6 transition-all hover:border-accent/30"
              >
                <h3 className="font-heading text-lg font-semibold text-ink transition-colors group-hover:text-accent">
                  {team.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {team.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  View team
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Venues / Where we play */}
      <section className="bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
                Where We Play
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Two venues built for the game
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                The Kings don't share gym space with a volleyball league. Both of our home facilities are designed for indoor soccer — dedicated surfaces, proper dimensions, and a game-day atmosphere.
              </p>
              <div className="mt-8 space-y-5">
                {venues.map((venue) => (
                  <div
                    key={venue.name}
                    className="flex items-start gap-4 rounded-xl border border-border bg-white p-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-ink">{venue.name}</p>
                      <p className="text-xs font-medium text-accent">{venue.role}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{venue.address}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/join/facilities"
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
                >
                  Full venue details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img
                src="/project/football-team/photos/court-sunset.jpg"
                alt="Futsal court at dusk"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-brand py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to play at this level?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Fill out the trial application and a coach will review it personally. We take every submission seriously.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/join/apply"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-heading text-base font-semibold text-ink transition-colors hover:bg-accent/90"
            >
              Apply for Tryout
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/club/affiliations"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 font-heading text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              View Affiliations
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
