import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowDown } from "lucide-react"

export const metadata: Metadata = {
  title: "Pathway to MASL2 | Baltimore Kings",
  description:
    "The Baltimore Kings competitive pathway — from futsal development through Kings 2, Kings 1, and MASL3 arena soccer up to the Salisbury Steaks MASL2 affiliate.",
}

const RUNGS = [
  {
    tag: "Entry",
    title: "Futsal Development",
    href: "/teams/futsal-kings-2",
    photo: "/project/football-team/photos/futsal-action.jpg",
    blurb:
      "Every player starts on the futsal court. Five-a-side, low-bounce ball, flat surface — the format that builds the cleanest first touch and the fastest decision-making in the game. New players join here, learn the club's methodology, and earn their place.",
  },
  {
    tag: "Step 2",
    title: "Futsal Kings 2",
    href: "/teams/futsal-kings-2",
    photo: "/project/football-team/photos/futsal-kings-2.jpg",
    blurb:
      "The development squad — not a B-team, but a proving ground. Same coaching, same tactical framework, same standards as the first team. Consistent quality and professionalism here earns a call-up to Kings 1.",
  },
  {
    tag: "Step 3",
    title: "Futsal Kings 1",
    href: "/teams/futsal-kings-1",
    photo: "/project/football-team/photos/futsal-kings-1.jpg",
    blurb:
      "The core of the club. League 1 futsal competition and the technical foundation everything else is built on. This is where the strongest futsal players compete week in, week out.",
  },
  {
    tag: "Step 4",
    title: "Kings MASL3 — Arena Soccer",
    href: "/teams/masl3",
    photo: "/project/football-team/photos/masl3-huddle.jpg",
    blurb:
      "Off-season arena soccer in Major Arena Soccer League 3. Six-a-side, boards, unlimited subs, 60-minute matches. Arena rewards the technique built on the futsal court — and puts players in front of the wider MASL scouting network.",
  },
  {
    tag: "Top Rung",
    title: "Salisbury Steaks — MASL2 Affiliate",
    href: "/teams/masl3",
    photo: "/project/football-team/photos/player-arena.jpg",
    blurb:
      "The Salisbury Steaks share management with the Baltimore Kings — same front office, same development philosophy. Standout MASL3 performers get called up to play MASL2 for Salisbury. No agent, no tryout circus: perform here, get promoted there.",
  },
]

export default function PathwayPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-court">
        <img
          src="/project/football-team/photos/court-aerial-1.jpg"
          alt="Futsal court from above"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-court via-court/75 to-court/40" />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-accent">
              The Competitive Ladder
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-paper sm:text-5xl">
              Pathway to MASL2
            </h1>
            <p className="mt-4 text-lg text-paper/80">
              One club, one progression. From the futsal court to professional arena
              soccer, the Baltimore Kings give every player a visible, merit-based route
              upward — ending at the Salisbury Steaks, our MASL2 affiliate.
            </p>
            <div className="mt-8">
              <Link href="/apply">
                <Button size="lg" className="bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full">
                  Start your pathway
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            How players move up
          </h2>
          <div className="mt-6 space-y-4 text-ink/80">
            <p>
              Most academies sell a dream with no ladder attached. The Kings do the
              opposite. Every team in the club is a rung — and the rungs connect.
            </p>
            <p>
              Coaching staff evaluate every player at every session and match. Promotion
              is earned on the court: technical quality, tactical understanding, and
              professionalism. There is no agent to hire and no politics to navigate.
            </p>
          </div>
        </div>
      </section>

      {/* The ladder */}
      <section className="bg-paper pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {RUNGS.map((rung, i) => (
              <div key={rung.title}>
                <Link
                  href={rung.href}
                  className="lift-card group grid overflow-hidden rounded-2xl border border-border bg-white sm:grid-cols-[260px_1fr]"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-secondary sm:aspect-auto">
                    <img
                      src={rung.photo}
                      alt={rung.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-6">
                    <span className="font-heading text-xs uppercase tracking-widest text-accent-dark">
                      {rung.tag}
                    </span>
                    <h3 className="mt-1 font-heading text-xl text-ink">
                      {rung.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {rung.blurb}
                    </p>
                  </div>
                </Link>
                {i < RUNGS.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-6 w-6 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            The ladder is open
          </h2>
          <p className="mt-3 text-muted-foreground">
            Wherever you are in your game, there is a rung for you. Try out, train, and
            climb.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/apply">
              <Button size="lg" className="bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full">
                Apply for a tryout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/roster">
              <Button size="lg" variant="outline" className="border-border font-heading font-semibold text-ink hover:bg-paper rounded-full">
                Meet the players
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
