import type { Metadata } from "next"
import { Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getInitials } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Coaches | Baltimore Kings",
  description:
    "Baltimore Kings coaching staff. Professional coaches with playing history and tactical expertise.",
}

export default async function CoachesPage() {
  const supabase = await createClient()

  const { data: coaches } = await supabase
    .from("profiles")
    .select("id, full_name, position_primary, bio, photo_url")
    .eq("role", "coach")
    .order("full_name", { ascending: true })

  const list = coaches ?? []

  return (
    <>
      <section className="border-b border-border bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="eyebrow text-brand">Leadership</p>
          <h1 className="mt-3 font-heading text-4xl tracking-tight text-ink sm:text-5xl">
            Coaching Staff
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Coaches who have played the game at a high level and know how to develop
            others. The people steering the Kings program day to day.
          </p>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {list.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((coach) => (
                <div
                  key={coach.id}
                  className="lift-card flex flex-col overflow-hidden rounded-2xl border border-border bg-white"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                    {coach.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coach.photo_url}
                        alt={coach.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-court">
                        <span className="font-heading text-5xl text-accent/80">
                          {getInitials(coach.full_name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-heading text-xl text-ink">
                      {coach.full_name}
                    </h2>
                    <p className="mt-1 font-heading text-sm uppercase tracking-wide text-accent-dark">
                      {coach.position_primary || "Coach"}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {coach.bio || "Bio coming soon."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-heading text-lg text-ink">
                Coaching staff coming soon
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Coach profiles will be published here shortly.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
