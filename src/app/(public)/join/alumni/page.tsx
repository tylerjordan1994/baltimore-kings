import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Alumni | Baltimore Kings",
  description: "Where Kings players go. Alumni who have moved up through the pathway.",
}

export default async function AlumniPage() {
  const supabase = await createClient()

  const { data: alumni } = await supabase
    .from("alumni")
    .select("*")
    .eq("published", true)
    .order("years", { ascending: false })

  const hasAlumni = alumni && alumni.length > 0

  return (
    <>
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Where Kings Go
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Players who came through the system and moved up.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {hasAlumni ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {alumni.map((person: any) => (
                <div
                  key={person.id}
                  className="rounded-xl border border-border bg-white p-6"
                >
                  {person.photo_url && (
                    <div className="mb-4 h-20 w-20 overflow-hidden rounded-full border border-border">
                      <img
                        src={person.photo_url}
                        alt={person.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <h2 className="font-heading text-lg font-semibold text-ink">{person.name}</h2>
                  {person.years && (
                    <p className="mt-1 text-xs text-muted-foreground">{person.years}</p>
                  )}
                  {person.status && (
                    <span className="mt-2 inline-block rounded-full bg-accent/10 px-3 py-0.5 text-xs font-medium text-accent">
                      {person.status}
                    </span>
                  )}
                  {person.current_team && (
                    <p className="mt-2 text-sm text-muted-foreground">{person.current_team}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-white p-8 text-center">
              <p className="text-sm text-muted-foreground italic">
                [NEEDS CONTENT] - Alumni profiles to be added
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
