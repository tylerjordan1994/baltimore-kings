import type { Metadata } from "next"
import { Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Coaches | Baltimore Kings",
  description: "Baltimore Kings coaching staff. Professional coaches with playing history and tactical expertise.",
}

const coachTemplate = [
  { name: "[Coach Name]", title: "[Head Coach / Assistant]", bio: "[Bio to be added]", credentials: "[Credentials]" },
  { name: "[Coach Name]", title: "[Head Coach / Assistant]", bio: "[Bio to be added]", credentials: "[Credentials]" },
  { name: "[Coach Name]", title: "[Head Coach / Assistant]", bio: "[Bio to be added]", credentials: "[Credentials]" },
]

export default function CoachesPage() {
  return (
    <>
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Coaching Staff
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Coaches who have played the game at a high level and know how to develop others.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-xl border border-border bg-white p-6">
            <p className="text-sm text-muted-foreground italic">
              [NEEDS CONTENT] - Coach bios, credentials, playing histories
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coachTemplate.map((coach, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-white p-6"
              >
                {/* Photo placeholder */}
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-paper">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="font-heading text-lg font-semibold text-ink">{coach.name}</h2>
                <p className="mt-1 text-sm text-accent">{coach.title}</p>
                <p className="mt-3 text-sm text-muted-foreground">{coach.bio}</p>
                <p className="mt-2 text-xs text-muted-foreground">{coach.credentials}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
