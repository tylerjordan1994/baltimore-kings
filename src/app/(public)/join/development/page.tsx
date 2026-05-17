import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Player Development | Baltimore Kings",
  description: "How the Baltimore Kings develop players. Tactical curriculum, regular evaluations, and structured orientation.",
}

export default function DevelopmentPage() {
  return (
    <>
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            How We Develop Players
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Structured training. Tactical education. Regular feedback. Not just games — a system designed to make you better.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Training Philosophy */}
          <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-ink">Training Philosophy</h2>
            <p className="mt-3 text-muted-foreground">
              Futsal is a thinking game. We train decision-making under pressure, 1v1 ability, and positional rotations. Every session has a tactical objective.
            </p>
          </div>

          {/* Tactical Curriculum */}
          <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-ink">Tactical Curriculum</h2>
            <p className="mt-3 text-muted-foreground">
              Defensive rotations, set pieces, transition play, powerplay and powerplay defense. We teach the game at a level most clubs never reach.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Explore our educational content on the{" "}
              <Link href="/learn" className="text-accent hover:text-accent/80 transition-colors">
                Learn
              </Link>{" "}
              page.
            </p>
          </div>

          {/* Evaluations */}
          <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-ink">Regular Evaluations</h2>
            <p className="mt-3 text-muted-foreground">
              Coaches assess player development throughout the season. You will know where you stand and what to work on.
            </p>
          </div>

          {/* Orientation */}
          <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-ink">New Player Orientation</h2>
            <p className="mt-3 text-muted-foreground">
              New players go through an orientation process that covers team systems, expectations, and culture. You will not be thrown in cold.
            </p>
          </div>

          {/* Training Schedule Placeholder */}
          <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
            <p className="text-sm text-muted-foreground italic">
              [NEEDS CONTENT] - Specific training schedule details to be added
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
