import Link from "next/link"
import {
  ArrowRight,
  MapPin,
  Trophy,
  Users,
  Zap,
  Camera,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import {
  Reveal,
  Parallax,
  CountUp,
  MagneticButton,
  TiltCard,
} from "@/components/home-motion"

const BP = "/project/football-team"

/* ─── Programs data ─── */
const PROGRAMS = [
  {
    href: "/teams/futsal-kings-1",
    league: "Pro-SA League 1 Futsal",
    name: "Futsal Kings 1",
    photo: `${BP}/photos/futsal-kings-1.jpg`,
    copy: "Five-a-side on a regulation court. The core of what we do — year-round development, national-level competition, and the technical foundation everything else builds on.",
    feature: true,
  },
  {
    href: "/teams/futsal-kings-2",
    league: "Pro-SA League 1 Futsal",
    name: "Kings 2",
    photo: `${BP}/photos/futsal-kings-2.jpg`,
    copy: "Development squad feeding into the first team. Same methodology, same pitch.",
    feature: false,
  },
  {
    href: "/teams/masl3",
    league: "Major Arena Soccer League 3",
    name: "MASL3",
    photo: `${BP}/photos/masl3-huddle.jpg`,
    copy: "Six-a-side walled arena. Off-season competition — faster, more physical, a different test.",
    feature: false,
  },
]

/* ─── Sponsor tier presentation ─── */
type Sponsor = {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  tier: string
  description: string | null
}

const SPONSOR_TIERS: Array<{
  key: string
  label: string
  badge: string
  logoHeight: string
}> = [
  {
    key: "platinum",
    label: "Platinum Partners",
    badge: "bg-accent text-ink",
    logoHeight: "h-20",
  },
  {
    key: "gold",
    label: "Gold Sponsors",
    badge: "bg-yellow-400 text-ink",
    logoHeight: "h-16",
  },
  {
    key: "silver",
    label: "Silver Sponsors",
    badge: "bg-slate-300 text-ink",
    logoHeight: "h-14",
  },
]

type SocialPost = {
  id: string
  source: string
  caption: string | null
  media_url: string | null
  external_url: string | null
  posted_at: string | null
}

function formatPostDate(value: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: sponsorData }, { data: socialData }] = await Promise.all([
    supabase
      .from("sponsors")
      .select("id, name, logo_url, website_url, tier, description")
      .eq("is_active", true)
      .order("order_index", { ascending: true }),
    supabase
      .from("social_posts")
      .select("id, source, caption, media_url, external_url, posted_at")
      .order("posted_at", { ascending: false, nullsFirst: false })
      .limit(6),
  ])

  const sponsors = (sponsorData as Sponsor[] | null) ?? []
  const socialPosts = (socialData as SocialPost[] | null) ?? []

  const sponsorTiers = SPONSOR_TIERS.map((tier) => ({
    ...tier,
    items: sponsors.filter((s) => s.tier === tier.key),
  })).filter((tier) => tier.items.length > 0)

  return (
    <>
      {/* ═══════════════ 1. CINEMATIC HERO ═══════════════ */}
      <section className="relative isolate min-h-[88vh] overflow-hidden bg-court">
        {/* Full-bleed background photo */}
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BP}/photos/court-sunset.jpg`}
            alt="Baltimore Kings indoor futsal court at sunset"
            className="h-full w-full object-cover"
          />
          {/* Cinematic dark gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-court via-court/55 to-court/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-court/85 via-court/30 to-court/10" />
        </div>

        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28 lg:pt-36">
          <div className="grid items-end gap-10 lg:grid-cols-12">
            {/* Headline block */}
            <div className="lg:col-span-7">
              <Reveal variant="up">
                <span className="inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-paper backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Est. 2012 &middot; Baltimore, MD
                </span>
              </Reveal>
              <Reveal variant="up" delay={140}>
                <h1 className="mt-6 font-heading text-[3rem] leading-[0.92] tracking-tight text-paper sm:text-7xl lg:text-8xl xl:text-[8.5rem]">
                  Baltimore&apos;s
                  <br />
                  <span className="text-accent">Futsal Club.</span>
                </h1>
              </Reveal>
              <Reveal variant="up" delay={280}>
                <p className="mt-7 max-w-xl text-base leading-relaxed text-paper/80 sm:text-lg">
                  Year-round development through Pro-SA League 1 Futsal, plus
                  MASL3 arena soccer when the lights come on. Train sharper,
                  compete higher — built in Baltimore since 2012.
                </p>
              </Reveal>
              <Reveal variant="up" delay={420}>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <MagneticButton
                    href={`${BP}/join/apply`}
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-ink shadow-lg shadow-accent/25 hover:bg-accent-light"
                  >
                    Apply for a tryout
                    <ArrowRight className="h-4 w-4" />
                  </MagneticButton>
                  <Link
                    href="/schedule"
                    className="inline-flex items-center rounded-full border border-paper/35 bg-paper/5 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-paper backdrop-blur-md transition-colors hover:bg-paper/15"
                  >
                    See the schedule
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Overlaid membership/tryout card — lower right */}
            <div className="lg:col-span-5 lg:pb-2">
              <Reveal variant="up" delay={360}>
                <div className="float-bob ml-auto w-full max-w-sm rounded-3xl border border-paper/15 bg-white/95 p-7 shadow-2xl shadow-court/40 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                      Tryouts Open
                    </p>
                    <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-dark">
                      2026 Season
                    </span>
                  </div>
                  <p className="mt-3 font-heading text-3xl leading-tight text-ink">
                    Join the Kings.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Open trials for all three squads. Outfield and goalkeepers
                    welcome — futsal experience a bonus, not a requirement.
                  </p>
                  <ul className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm text-ink">
                    {[
                      "League 1 Futsal & MASL3 pathways",
                      "Benfield Sports & GOALS Baltimore",
                      "Year-round structured development",
                    ].map((line) => (
                      <li key={line} className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton
                    href={`${BP}/join/apply`}
                    strength={0.25}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-paper hover:bg-brand-light"
                  >
                    Start application
                    <ArrowRight className="h-4 w-4" />
                  </MagneticButton>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 2. KINETIC MARQUEE ═══════════════ */}
      <section className="overflow-hidden border-y border-brand-light/30 bg-brand py-5 md:py-6">
        <div className="group flex whitespace-nowrap">
          <div className="animate-marquee flex shrink-0 items-center gap-6 group-hover:[animation-play-state:paused]">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="font-heading text-2xl uppercase text-paper/25 md:text-4xl"
              >
                League 1 Futsal{" "}
                <span className="text-accent/50">&middot;</span> MASL3{" "}
                <span className="text-accent/50">&middot;</span> Baltimore Kings{" "}
                <span className="text-accent/50">&middot;</span> Est. 2012{" "}
                <span className="text-accent/50">&middot;</span>&nbsp;
              </span>
            ))}
          </div>
          <div
            className="animate-marquee flex shrink-0 items-center gap-6 group-hover:[animation-play-state:paused]"
            aria-hidden
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="font-heading text-2xl uppercase text-paper/25 md:text-4xl"
              >
                League 1 Futsal{" "}
                <span className="text-accent/50">&middot;</span> MASL3{" "}
                <span className="text-accent/50">&middot;</span> Baltimore Kings{" "}
                <span className="text-accent/50">&middot;</span> Est. 2012{" "}
                <span className="text-accent/50">&middot;</span>&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 3. STATS BAND ═══════════════ */}
      <section className="bg-paper py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal variant="up">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              The Club, By the Numbers
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
            {[
              { value: 2012, label: "Year Founded", suffix: "" },
              { value: 30, label: "Active Players", suffix: "+" },
              { value: 4, label: "Squads Fielded", suffix: "" },
              { value: 2, label: "Home Venues", suffix: "" },
            ].map((stat, i) => (
              <Reveal key={stat.label} variant="up" delay={i * 110}>
                <div className="flex h-full flex-col justify-center bg-white px-6 py-9 transition-colors duration-300 hover:bg-secondary">
                  <p className="stat-number text-5xl text-ink sm:text-6xl">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 4. PROGRAMS ═══════════════ */}
      <section className="relative bg-paper pb-24 sm:pb-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Reveal variant="up">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                  Our Programs
                </p>
              </Reveal>
              <Reveal variant="up" delay={120}>
                <h2 className="mt-3 max-w-xl font-heading text-3xl leading-tight text-ink sm:text-5xl">
                  Three squads. One development pathway.
                </h2>
              </Reveal>
            </div>
            <Reveal variant="up" delay={200}>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Every player has a route forward — from the development squad
                to first-team futsal and arena soccer.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-5">
            {/* Feature card */}
            <Reveal variant="left" className="lg:col-span-3">
              <Link href={PROGRAMS[0].href} className="group block h-full">
                <TiltCard
                  max={5}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white"
                >
                  <div className="zoom-frame relative aspect-[16/10] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={PROGRAMS[0].photo}
                      alt={PROGRAMS[0].name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-court/55 to-transparent" />
                    <span className="absolute left-5 top-5 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">
                      First Team
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-7">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {PROGRAMS[0].league}
                      </span>
                      <h3 className="mt-2 font-heading text-3xl text-ink sm:text-4xl">
                        {PROGRAMS[0].name}
                      </h3>
                      <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                        {PROGRAMS[0].copy}
                      </p>
                    </div>
                    <span className="mt-6 inline-flex items-center text-sm font-semibold text-brand">
                      See team
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </TiltCard>
              </Link>
            </Reveal>

            {/* Stacked cards */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {PROGRAMS.slice(1).map((p, i) => (
                <Reveal
                  key={p.href}
                  variant="right"
                  delay={i * 130}
                  className="flex-1"
                >
                  <Link href={p.href} className="group block h-full">
                    <div className="lift-card flex h-full overflow-hidden rounded-2xl border border-border bg-white">
                      <div className="zoom-frame relative w-2/5 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.photo}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {p.league}
                          </span>
                          <h3 className="mt-1.5 font-heading text-xl text-ink">
                            {p.name}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {p.copy}
                          </p>
                        </div>
                        <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand">
                          See team
                          <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 5. ABOUT — parallax split ═══════════════ */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal variant="left">
              <div className="relative">
                <Parallax
                  src={`${BP}/photos/player-light.jpg`}
                  alt="Baltimore Kings player in dramatic light"
                  strength={50}
                  className="aspect-[4/5] w-full rounded-[28px]"
                />
                {/* Overlapping accent stat chip */}
                <div className="float-bob absolute -bottom-8 -right-4 rounded-2xl border border-border bg-white p-5 shadow-xl sm:-right-8">
                  <p className="stat-number font-heading text-4xl text-brand">
                    <CountUp value={14} suffix=" yrs" />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                    Building Baltimore futsal
                  </p>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal variant="up">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                  The Club
                </p>
              </Reveal>
              <Reveal variant="up" delay={110}>
                <h2 className="mt-4 font-heading text-3xl leading-tight text-ink sm:text-5xl">
                  Futsal-first.
                  <br />
                  Baltimore-built.
                </h2>
              </Reveal>
              <Reveal variant="up" delay={210}>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  The Baltimore Kings exist to run elite futsal programming in a
                  city that deserves it. Founded in 2012 through Pro-SA, we
                  field multiple teams across League 1 Futsal and MASL3 arena
                  soccer — giving players a genuine pathway from local courts to
                  the highest level of the indoor game.
                </p>
              </Reveal>

              <div className="mt-10 grid gap-5 sm:grid-cols-3">
                {[
                  {
                    icon: Trophy,
                    title: "League 1",
                    body: "National-level Pro-SA futsal competition.",
                  },
                  {
                    icon: Zap,
                    title: "MASL3",
                    body: "Fast, physical six-a-side arena soccer.",
                  },
                  {
                    icon: Users,
                    title: "Pathway to Pro",
                    body: "Development squad to first-team futsal, MASL3, and the road to the pro game.",
                  },
                ].map((f, i) => (
                  <Reveal key={f.title} variant="up" delay={300 + i * 110}>
                    <div className="lift-card rounded-xl border border-border bg-white p-5">
                      <f.icon className="h-6 w-6 text-accent" />
                      <p className="mt-3 font-heading text-base text-ink">
                        {f.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {f.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 6. PINNED ACTION SHOWCASE ═══════════════ */}
      <section className="relative bg-court">
        {/* Sticky/pinned full-bleed image with scrolling copy over it */}
        <div className="relative">
          <div className="sticky top-0 h-screen overflow-hidden">
            <Parallax
              src={`${BP}/photos/futsal-action.jpg`}
              alt="Baltimore Kings futsal in action"
              strength={80}
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-court/70 via-court/35 to-court/90" />
          </div>

          {/* Scrolling content panels over the pinned image */}
          <div className="absolute inset-0">
            <div className="flex h-screen items-center justify-center px-6">
              <Reveal variant="up" className="max-w-3xl text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                  This Is Futsal
                </p>
                <h2 className="mt-4 font-heading text-4xl leading-[1.02] text-paper sm:text-6xl lg:text-7xl">
                  Smaller pitch.
                  <br />
                  Sharper players.
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg">
                  A heavier ball, tighter spaces, and constant decisions. Futsal
                  forges the close control, quick thinking, and composure that
                  separates good players from great ones.
                </p>
              </Reveal>
            </div>
            <div className="flex h-screen items-center px-6">
              <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
                {[
                  {
                    n: "01",
                    t: "Technical",
                    d: "Constant touches in tight space sharpen first touch and ball mastery.",
                  },
                  {
                    n: "02",
                    t: "Tactical",
                    d: "Five players, no walls — spacing, rotations and reads matter every second.",
                  },
                  {
                    n: "03",
                    t: "Relentless",
                    d: "Rolling subs and a running clock demand intensity from whistle to whistle.",
                  },
                ].map((c, i) => (
                  <Reveal key={c.n} variant="up" delay={i * 150}>
                    <div className="rounded-2xl border border-paper/15 bg-court/50 p-7 backdrop-blur-md">
                      <p className="font-heading text-3xl text-accent">{c.n}</p>
                      <p className="mt-3 font-heading text-xl text-paper">
                        {c.t}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-paper/65">
                        {c.d}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 7. WHERE WE PLAY ═══════════════ */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal variant="up">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Where We Play
            </p>
          </Reveal>
          <Reveal variant="up" delay={110}>
            <h2 className="mt-3 max-w-xl font-heading text-3xl leading-tight text-ink sm:text-5xl">
              Two homes across the Baltimore area.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {[
              {
                photo: `${BP}/photos/court-aerial-1.jpg`,
                tag: "Home Pitch — Futsal",
                name: "Benfield Sports",
                addr: "1031 Benfield Blvd, Millersville, MD 21108",
              },
              {
                photo: `${BP}/photos/player-arena.jpg`,
                tag: "Home Arena — MASL3",
                name: "GOALS Baltimore",
                addr: "6159 Edmondson Ave, Catonsville, MD 21228",
              },
            ].map((v, i) => (
              <Reveal key={v.name} variant={i === 0 ? "left" : "right"}>
                <div className="lift-card overflow-hidden rounded-2xl border border-border bg-white">
                  <div className="zoom-frame relative aspect-[16/9] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.photo}
                      alt={v.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-court/55 to-transparent" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {v.tag}
                    </p>
                    <h3 className="mt-2 font-heading text-2xl text-ink">
                      {v.name}
                    </h3>
                    <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{v.addr}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 8. ON INSTAGRAM ═══════════════ */}
      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Reveal variant="up">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                  <Camera className="h-4 w-4 text-accent" />
                  On Instagram
                </p>
              </Reveal>
              <Reveal variant="up" delay={110}>
                <h2 className="mt-3 max-w-md font-heading text-3xl leading-tight text-ink sm:text-4xl">
                  Straight from the court.
                </h2>
              </Reveal>
            </div>
            <Reveal variant="up" delay={200}>
              <a
                href="https://www.instagram.com/baltimoreprofutsal/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink transition-colors hover:border-accent hover:text-brand"
              >
                <Camera className="h-4 w-4" />
                @baltimoreprofutsal
              </a>
            </Reveal>
          </div>

          {socialPosts.length > 0 ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {socialPosts.map((post, i) => {
                const Wrapper = post.external_url ? "a" : "div"
                const wrapperProps = post.external_url
                  ? {
                      href: post.external_url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {}
                return (
                  <Reveal key={post.id} variant="up" delay={i * 90}>
                    <Wrapper
                      {...wrapperProps}
                      className="lift-card group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white"
                    >
                      {/* Media */}
                      <div className="zoom-frame relative aspect-square w-full overflow-hidden bg-court">
                        {post.media_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.media_url}
                            alt={post.caption ?? "Baltimore Kings social post"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-brand via-court to-court">
                            <Camera className="h-10 w-10 text-accent" />
                            <span className="mt-3 font-heading text-sm uppercase tracking-widest text-paper/70">
                              Baltimore Kings
                            </span>
                          </div>
                        )}
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-court/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper backdrop-blur-sm">
                          <Camera className="h-3 w-3" />
                          {post.source}
                        </span>
                      </div>
                      {/* Caption */}
                      <div className="flex flex-1 flex-col justify-between p-5">
                        <p className="line-clamp-3 text-sm leading-relaxed text-ink">
                          {post.caption ?? "Baltimore Kings"}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                            {formatPostDate(post.posted_at)}
                          </span>
                          {post.external_url && (
                            <span className="inline-flex items-center text-xs font-semibold text-brand">
                              View post
                              <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                            </span>
                          )}
                        </div>
                      </div>
                    </Wrapper>
                  </Reveal>
                )
              })}
            </div>
          ) : (
            <Reveal variant="up">
              <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
                <Camera className="h-10 w-10 text-accent" />
                <p className="mt-4 font-heading text-xl text-ink">
                  Follow the Kings on Instagram
                </p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  New posts from matchday and training will show up here. In the
                  meantime, catch the latest on our feed.
                </p>
                <a
                  href="https://www.instagram.com/baltimoreprofutsal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-paper transition-colors hover:bg-brand-light"
                >
                  <Camera className="h-4 w-4" />
                  @baltimoreprofutsal
                </a>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ═══════════════ 9. SPONSORS — by tier ═══════════════ */}
      <section className="border-y border-border bg-paper py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Reveal variant="up">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                  Partners &amp; Sponsors
                </p>
              </Reveal>
              <Reveal variant="up" delay={110}>
                <h2 className="mt-3 max-w-md font-heading text-3xl leading-tight text-ink sm:text-4xl">
                  The brands behind the Kings.
                </h2>
              </Reveal>
            </div>
            <Reveal variant="up" delay={200}>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Local businesses keep the Kings playing. Sponsorship slots are
                open across kits, courtside boards and matchday.
              </p>
            </Reveal>
          </div>

          {sponsorTiers.length > 0 ? (
            <div className="mt-12 space-y-12">
              {sponsorTiers.map((tier) => (
                <Reveal key={tier.key} variant="up">
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${tier.badge}`}
                      >
                        {tier.label}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {tier.items.map((sponsor) => {
                        const Wrapper =
                          sponsor.website_url && sponsor.website_url !== "#"
                            ? "a"
                            : "div"
                        const wrapperProps =
                          sponsor.website_url && sponsor.website_url !== "#"
                            ? {
                                href: sponsor.website_url,
                                target: "_blank",
                                rel: "noopener noreferrer",
                              }
                            : {}
                        return (
                          <Wrapper
                            key={sponsor.id}
                            {...wrapperProps}
                            className="group flex flex-col items-center justify-center rounded-xl border border-border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg"
                          >
                            <div
                              className={`flex w-full items-center justify-center ${tier.logoHeight}`}
                            >
                              {sponsor.logo_url &&
                              sponsor.logo_url !== "#" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={sponsor.logo_url}
                                  alt={sponsor.name}
                                  className="max-h-full max-w-full object-contain grayscale transition-all duration-300 group-hover:grayscale-0"
                                />
                              ) : (
                                <span className="font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors group-hover:text-ink">
                                  {sponsor.name}
                                </span>
                              )}
                            </div>
                            {sponsor.logo_url &&
                              sponsor.logo_url !== "#" && (
                                <span className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  {sponsor.name}
                                </span>
                              )}
                          </Wrapper>
                        )
                      })}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal variant="up">
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex aspect-[3/2] flex-col items-center justify-center rounded-xl border border-dashed border-ink/20 bg-white"
                  >
                    <div className="h-8 w-8 rounded-full bg-ink/10" />
                    <span className="mt-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Your Brand Here
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal variant="up" delay={120}>
            <div className="mt-12 flex justify-center">
              <MagneticButton
                href={`${BP}/club/sponsors`}
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-ink transition-colors hover:border-accent hover:text-brand"
              >
                Become a sponsor
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ 10. APPLY CTA (DARK) ═══════════════ */}
      <section className="relative overflow-hidden bg-court py-28 sm:py-40">
        {/* Subtle background photo */}
        <div className="absolute inset-0 opacity-25">
          <Parallax
            src={`${BP}/photos/player-kick.jpg`}
            alt=""
            strength={70}
            className="h-full w-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-court/70 via-court/80 to-court" />

        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <Reveal variant="up">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              2026 Tryouts Open
            </p>
          </Reveal>
          <Reveal variant="scale" delay={120}>
            <h2 className="mt-5 font-heading text-4xl leading-[1.02] text-paper sm:text-6xl lg:text-7xl">
              Think you have
              <br />
              <span className="sheen-text">what it takes?</span>
            </h2>
          </Reveal>
          <Reveal variant="up" delay={260}>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-paper/70">
              Trials are open for all three squads. Bring your touch — we&apos;ll
              build the rest.
            </p>
          </Reveal>
          <Reveal variant="up" delay={380}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <MagneticButton
                href={`${BP}/join/apply`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-10 py-4 text-sm font-bold uppercase tracking-wide text-ink shadow-xl shadow-accent/20 hover:bg-accent-light"
              >
                Start your application
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <Link
                href="/schedule"
                className="inline-flex items-center rounded-full border border-paper/30 px-10 py-4 text-sm font-bold uppercase tracking-wide text-paper transition-colors hover:bg-paper/10"
              >
                View the schedule
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
