import Link from "next/link"
import { ArrowRight, MapPin, Calendar, Users, ChevronDown, Zap } from "lucide-react"

// basePath handled by next.config.ts

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {/* Radial glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(201,169,78,0.15),_transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(201,169,78,0.05),_transparent)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p
              className="text-xs font-semibold uppercase tracking-widest text-gold"
              style={{ fontVariant: "small-caps" }}
            >
              League 1 Futsal &middot; MASL3 &middot; Baltimore
            </p>

            <h1 className="mt-6 font-heading text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Baltimore&rsquo;s futsal club.
              <br />
              <span className="text-white/80">Arena soccer when the court&rsquo;s dark.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
              The Baltimore Kings run year-round futsal development through Pro-SA League 1, plus MASL3 arena soccer in the off-season. We train at Benfield Sportscenter and play home games at GOALS Baltimore.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/apply"
                className="inline-flex items-center rounded-full bg-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-[#0a0a0a] transition-all hover:bg-gold-light hover:shadow-[0_0_24px_rgba(201,169,78,0.3)]"
              >
                Apply for a Tryout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/schedule"
                className="inline-flex items-center rounded-full border border-white/30 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:border-white/60 hover:bg-white/5"
              >
                See the Schedule
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/40" />
        </div>
      </section>

      {/* Programs */}
      <section className="bg-[#0a0a0a] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">Our Programs</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
          </div>
          <p className="mt-3 text-white/50">Two competitions. Two pathways up.</p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 — Futsal (gold top accent) */}
            <Link href="/teams/futsal-l1" className="group">
              <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-gold/30 hover:bg-white/[0.07]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <Users className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-white group-hover:text-gold">
                  Futsal League 1
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  Five-a-side on a regulation court. The core of what we do. Year-round development, League 1 competition, and the technical foundation everything else builds on.
                </p>
                <span className="mt-5 inline-flex items-center text-sm font-medium text-gold">
                  View team <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Card 2 — MASL3 */}
            <Link href="/teams/masl3" className="group">
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-gold/30 hover:bg-white/[0.07]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Zap className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-white group-hover:text-gold">
                  MASL3 Arena Soccer
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  Six-a-side on a walled arena pitch. Off-season competition in Major Arena Soccer League 3. Faster, more physical — a different test for the same players.
                </p>
                <span className="mt-5 inline-flex items-center text-sm font-medium text-gold">
                  View team <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Card 3 — Pathways (dashed) */}
            <div className="h-full rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-gold/30 hover:bg-white/[0.07]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-white/20">
                <ArrowRight className="h-6 w-6 text-white/50" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-white">Two Pathways Up</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Futsal: Kings L1F &rarr; national-level futsal, professional clubs domestically/internationally. Arena: Kings MASL3 &rarr; Salisbury Steaks (MASL2) &rarr; MASL1 / Baltimore Blast.
              </p>
              <Link
                href="/teams/masl3#pathway"
                className="mt-5 inline-flex items-center text-sm font-medium text-gold hover:text-gold-light"
              >
                Learn about the pathways <ArrowRight className="ml-1.5 h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="bg-[#080808] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">Where We Play</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-gold/30 hover:bg-white/[0.07]">
              <div className="aspect-video w-full bg-black/50">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3087.5!2d-76.6!3d39.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sGOALS+Baltimore!5e0!3m2!1sen!2sus!4v1"
                  className="h-full w-full border-0"
                  loading="lazy"
                  title="GOALS Baltimore location"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">GOALS Baltimore</h3>
                    <p className="mt-1 text-sm text-white/60">Home games — MASL3 match days</p>
                    <p className="mt-1 text-xs text-white/40">
                      [NEEDS CONFIRMATION] Exact address. Parking available on-site.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-gold/30 hover:bg-white/[0.07]">
              <div className="aspect-video w-full bg-black/50">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3087.5!2d-76.6!3d39.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBenfield+Sportscenter!5e0!3m2!1sen!2sus!4v1"
                  className="h-full w-full border-0"
                  loading="lazy"
                  title="Benfield Sports location"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">Benfield Sportscenter</h3>
                    <p className="mt-1 text-sm text-white/60">Practice facility — weekly training sessions</p>
                    <p className="mt-1 text-xs text-white/40">
                      903 Benfield Rd, Severna Park, MD 21146
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="bg-[#0a0a0a] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">Upcoming</h2>
            <Link
              href="/schedule"
              className="text-sm font-medium text-gold transition-colors hover:text-gold-light"
            >
              Full schedule <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </div>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-sm">
            <Calendar className="mx-auto h-10 w-10 text-white/30" />
            <p className="mt-4 text-white/60">
              Schedule updates coming soon. Check back for the 2025-2026 season fixtures.
            </p>
          </div>
        </div>
      </section>

      {/* Sponsors / Affiliations */}
      <section className="border-t border-white/5 bg-[#080808] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-white/40">
            Affiliated with
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-10">
            <a
              href="https://www.masl3.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-white/40 transition-colors hover:text-gold"
            >
              MASL3
            </a>
            <a
              href="http://www.prosocceralliance.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-white/40 transition-colors hover:text-gold"
            >
              Pro-SA
            </a>
            <span className="text-sm text-white/40 transition-colors hover:text-gold">
              Salisbury Steaks (MASL2)
            </span>
          </div>
        </div>
      </section>
    </>
  )
}
