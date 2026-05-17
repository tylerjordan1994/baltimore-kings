import Link from "next/link"
import { ChevronDown, ArrowRight, MapPin } from "lucide-react"

export default function HomePage() {
  return (
    <>
      {/* ─── 1. HERO ─── */}
      <section className="relative min-h-screen bg-paper">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
          {/* Left — copy */}
          <div className="relative z-10 w-full shrink-0 py-24 lg:w-[40%] lg:py-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              League 1 Futsal &middot; MASL3 &middot; Baltimore
            </p>

            <h1 className="mt-6 font-heading text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
              Baltimore&rsquo;s
              <br />
              futsal club.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Year-round futsal development through Pro-SA League 1, plus MASL3 arena soccer when the lights come on.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/apply"
                className="inline-flex items-center rounded-full bg-brand px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-paper transition-opacity hover:opacity-90"
              >
                Apply for a tryout
              </Link>
              <Link
                href="/schedule"
                className="inline-flex items-center rounded-full border border-ink/20 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-ink transition-colors hover:border-ink/40"
              >
                See the schedule
              </Link>
            </div>
          </div>

          {/* Right — photo placeholder with pattern */}
          <div className="relative hidden w-full lg:block lg:w-[60%]">
            <div
              className="aspect-[3/4] max-h-[85vh] w-full rounded-2xl bg-gradient-to-b from-brand/10 to-paper"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231a2744' fill-opacity='0.04'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {/* TODO: Replace with futsal court action photo */}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-6 animate-bounce lg:left-8">
          <ChevronDown className="h-5 w-5 text-ink/40" />
        </div>
      </section>

      {/* ─── 2. KINETIC MARQUEE ─── */}
      <section className="overflow-hidden bg-brand py-10 md:py-12">
        <div className="group flex whitespace-nowrap">
          <div className="animate-marquee flex shrink-0 items-center gap-8 group-hover:[animation-play-state:paused]">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="font-heading text-7xl uppercase text-paper/20 md:text-9xl"
              >
                League 1 Futsal &middot; MASL3 &middot; Baltimore Kings &middot; Est. 2012 &middot;&nbsp;
              </span>
            ))}
          </div>
          <div className="animate-marquee flex shrink-0 items-center gap-8 group-hover:[animation-play-state:paused]" aria-hidden>
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="font-heading text-7xl uppercase text-paper/20 md:text-9xl"
              >
                League 1 Futsal &middot; MASL3 &middot; Baltimore Kings &middot; Est. 2012 &middot;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. TEAMS / PROGRAMS ─── */}
      <section className="relative bg-paper py-24 sm:py-32">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">Our Programs</p>

          <div className="mt-12 grid gap-6 lg:grid-cols-5">
            {/* Large card — Futsal Kings 1 */}
            <Link href="/teams/futsal-kings-1" className="group lg:col-span-3">
              <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-white p-8 transition-all duration-200 hover:border-brand/30 hover:-translate-y-1">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pro-SA League 1 Futsal</span>
                  <h3 className="mt-3 font-heading text-3xl text-ink sm:text-4xl">Futsal Kings 1</h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                    Five-a-side on a regulation court. The core of what we do — year-round development, national-level competition, and the technical foundation everything else builds on.
                  </p>
                </div>
                <span className="mt-8 inline-flex items-center text-sm font-semibold text-brand">
                  See team <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Stacked smaller cards */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <Link href="/teams/futsal-kings-2" className="group flex-1">
                <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-white p-6 transition-all duration-200 hover:border-brand/30 hover:-translate-y-1">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pro-SA League 1 Futsal</span>
                    <h3 className="mt-2 font-heading text-xl text-ink">Kings 2</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Development squad feeding into the first team. Same methodology, same pitch.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand">
                    See team <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>

              <Link href="/teams/masl3" className="group flex-1">
                <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-white p-6 transition-all duration-200 hover:border-brand/30 hover:-translate-y-1">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Major Arena Soccer League 3</span>
                    <h3 className="mt-2 font-heading text-xl text-ink">MASL3</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Six-a-side walled arena. Off-season competition — faster, more physical, a different test.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand">
                    See team <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. ABOUT THE CLUB ─── */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Photo placeholder */}
            <div className="relative lg:-ml-8">
              <div className="aspect-[4/5] w-full rounded-2xl bg-gradient-to-br from-brand/10 via-accent/5 to-paper">
                {/* TODO: Replace with club photo */}
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">The Club</p>
              <h2 className="mt-4 font-heading text-3xl text-ink sm:text-4xl">
                Futsal-first. Baltimore-built.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                The Baltimore Kings exist to run elite futsal programming in a city that deserves it. Founded through Pro-SA and affiliated with the Salisbury Steaks organization, we field multiple teams across League 1 Futsal and MASL3 — giving players a genuine pathway from local courts to professional contracts.
              </p>

              {/* Stat blocks */}
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
                <div>
                  <p className="font-heading text-5xl text-ink">2012</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Founded</p>
                </div>
                <div>
                  <p className="font-heading text-5xl text-ink">30+</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Active Players</p>
                </div>
                <div>
                  <p className="font-heading text-5xl text-ink">3</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Teams Fielded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. WHERE WE PLAY ─── */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">Where We Play</p>

          <div className="mt-12 grid gap-6 lg:grid-cols-9">
            {/* Benfield — 55% */}
            <div className="overflow-hidden rounded-xl border border-border bg-white lg:col-span-5">
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3090.5!2d-76.624!3d39.121!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7f8a0c0e7b7d%3A0x0!2zMTAzMSBCZW5maWVsZCBCbHZk!5e0!3m2!1sen!2sus"
                  className="h-full w-full border-0"
                  loading="lazy"
                  title="Benfield Sports location"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Home Pitch — Futsal
                </p>
                <h3 className="mt-2 font-heading text-xl text-ink">Benfield Sports</h3>
                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>1031 Benfield Blvd, Millersville, MD 21108</span>
                </div>
              </div>
            </div>

            {/* GOALS — 45% */}
            <div className="overflow-hidden rounded-xl border border-border bg-white lg:col-span-4">
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3087.5!2d-76.731!3d39.272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c81f8a0c0e7b7d%3A0x0!2zNjE1OSBFZG1vbmRzb24gQXZl!5e0!3m2!1sen!2sus"
                  className="h-full w-full border-0"
                  loading="lazy"
                  title="GOALS Baltimore location"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Home Arena — MASL3
                </p>
                <h3 className="mt-2 font-heading text-xl text-ink">GOALS Baltimore</h3>
                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>6159 Edmondson Ave, Catonsville, MD 21228</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. APPLY CTA (DARK) ─── */}
      <section className="bg-court py-28 sm:py-36">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-4xl text-paper sm:text-5xl lg:text-6xl">
            Think you can play here?
          </h2>
          <div className="mt-10">
            <Link
              href="/apply"
              className="inline-flex items-center rounded-full bg-accent px-10 py-4 text-sm font-bold uppercase tracking-wide text-ink transition-opacity hover:opacity-90"
            >
              Start your application
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
