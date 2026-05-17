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
      <section className="bg-[#0a0a0a] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Coaching Staff
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            Coaches who have played the game at a high level and know how to develop others.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0a0a] pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/40 italic">
              [NEEDS CONTENT] - Coach bios, credentials, playing histories
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coachTemplate.map((coach, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                {/* Photo placeholder */}
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
                  <Users className="h-8 w-8 text-white/20" />
                </div>
                <h2 className="font-heading text-lg font-semibold text-white">{coach.name}</h2>
                <p className="mt-1 text-sm text-gold">{coach.title}</p>
                <p className="mt-3 text-sm text-white/60">{coach.bio}</p>
                <p className="mt-2 text-xs text-white/40">{coach.credentials}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
