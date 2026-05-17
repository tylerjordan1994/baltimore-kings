import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Player Development | Baltimore Kings",
  description: "How the Baltimore Kings develop players. Tactical curriculum, regular evaluations, and structured orientation.",
}

export default function DevelopmentPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-court py-28 sm:py-36">
        <img
          src="/project/football-team/photos/futsal-kings-2.jpg"
          alt="Kings players in training"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            How We Develop Players
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
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
              Tactical work is built into every session — from first-team
              futsal through the development squad.
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

          {/* Training Schedule */}
          <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-ink">Training Schedule</h2>
            <p className="mt-3 text-muted-foreground">
              The Kings train twice per week during the competitive season, with optional additional sessions during pre-season prep. Training days are Tuesday and Thursday evenings at Benfield Sports in Millersville.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-paper p-4">
                <p className="font-heading text-sm font-semibold text-ink">Tuesday Evenings</p>
                <p className="mt-1 text-sm text-muted-foreground">Tactical sessions — system work, set pieces, and game preparation</p>
                <p className="mt-1 text-xs text-accent">Benfield Sports · 8:00 PM – 9:30 PM</p>
              </div>
              <div className="rounded-lg border border-border bg-paper p-4">
                <p className="font-heading text-sm font-semibold text-ink">Thursday Evenings</p>
                <p className="mt-1 text-sm text-muted-foreground">Technical sessions — individual skill work, small-sided games, pressure training</p>
                <p className="mt-1 text-xs text-accent">Benfield Sports · 8:00 PM – 9:30 PM</p>
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="overflow-hidden rounded-xl">
            <img
              src="/project/football-team/photos/court-shoes.jpg"
              alt="Futsal court and player equipment"
              className="h-56 w-full object-cover"
            />
          </div>
        </div>
      </section>
    </>
  )
}
