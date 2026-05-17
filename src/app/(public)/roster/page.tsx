"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Users } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

type RosterMember = {
  id: string
  team_slug: string
  jersey_number: number | null
  position: string | null
  status: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

const TEAM_FILTERS = [
  { slug: "all", label: "All" },
  { slug: "baltimore-kings-masl3", label: "MASL3" },
  { slug: "baltimore-kings-futsal-l1", label: "Futsal L1" },
]

export default function RosterPage() {
  const [roster, setRoster] = useState<RosterMember[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchRoster() {
      const { data } = await supabase
        .from("team_members")
        .select("*, profiles(*)")
        .eq("status", "active")
        .order("jersey_number", { ascending: true })

      setRoster((data as RosterMember[]) || [])
      setLoading(false)
    }

    fetchRoster()
  }, [])

  const filtered = filter === "all" ? roster : roster.filter((m) => m.team_slug === filter)

  return (
    <>
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Full Roster
          </h1>
          <p className="mt-2 text-muted-foreground">
            Every active player across both squads.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            {TEAM_FILTERS.map((t) => (
              <button
                key={t.slug}
                onClick={() => setFilter(t.slug)}
                className={`rounded-full px-4 py-1.5 font-heading text-sm font-semibold transition-all ${
                  filter === t.slug
                    ? "bg-brand text-paper"
                    : "border border-border bg-white text-ink/70 hover:border-accent/30 hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-12 text-center text-muted-foreground">Loading roster...</div>
          ) : filtered.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((member) => (
                <div
                  key={member.id}
                  className="relative overflow-hidden rounded-xl border border-border bg-white p-4 transition-all hover:border-accent/30"
                >
                  <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-paper mx-auto">
                    {member.profiles?.avatar_url ? (
                      <Image
                        src={member.profiles.avatar_url}
                        alt={member.profiles.full_name || "Player"}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-center">
                    {member.jersey_number && (
                      <span className="font-heading text-xs font-bold text-accent">
                        #{member.jersey_number}
                      </span>
                    )}
                    <p className="font-heading text-sm font-semibold leading-tight text-ink">
                      {member.profiles?.full_name || "TBA"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {member.position || "—"}
                    </p>
                    <span className="mt-1.5 inline-block rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {member.team_slug === "baltimore-kings-masl3" ? "MASL3" : "Futsal L1"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-heading text-lg font-semibold text-ink">No players found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {filter === "all"
                  ? "Roster announcements coming soon."
                  : "No active players on this team yet."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
