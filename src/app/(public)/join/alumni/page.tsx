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
      <section className="bg-[#0a0a0a] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Where Kings Go
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            Players who came through the system and moved up.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0a0a] pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {hasAlumni ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {alumni.map((person: any) => (
                <div
                  key={person.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  {person.photo_url && (
                    <div className="mb-4 h-20 w-20 overflow-hidden rounded-full border border-white/10">
                      <img
                        src={person.photo_url}
                        alt={person.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <h2 className="font-heading text-lg font-semibold text-white">{person.name}</h2>
                  {person.years && (
                    <p className="mt-1 text-xs text-white/40">{person.years}</p>
                  )}
                  {person.status && (
                    <span className="mt-2 inline-block rounded-full bg-gold/10 px-3 py-0.5 text-xs font-medium text-gold">
                      {person.status}
                    </span>
                  )}
                  {person.current_team && (
                    <p className="mt-2 text-sm text-white/60">{person.current_team}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-sm text-white/40 italic">
                [NEEDS CONTENT] - Alumni profiles to be added
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
