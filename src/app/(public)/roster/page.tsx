"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Users } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { PlayerCard, type PlayerCardData } from "@/components/player-card"
import { teamTag } from "@/lib/utils"

type MemberRow = {
  id: string
  position: string | null
  jersey_number_for_team: number | null
  is_active: boolean
  teams: { slug: string } | null
  profiles: {
    id: string
    full_name: string
    photo_url: string | null
    jersey_number: number | null
    position_primary: string | null
    nickname: string | null
    status: string
    role: string
    also_plays_for_steaks: boolean
  } | null
}

type RosterPlayer = PlayerCardData & {
  teamSlugs: string[]
}

const TEAM_FILTERS = [
  { tag: "all", label: "All Players" },
  { tag: "K1", label: "Futsal Kings 1" },
  { tag: "K2", label: "Futsal Kings 2" },
  { tag: "MASL3", label: "MASL3" },
  { tag: "Steaks", label: "Steaks" },
]

export default function RosterPage() {
  const [players, setPlayers] = useState<RosterPlayer[]>([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchRoster() {
      const { data } = await supabase
        .from("team_members")
        .select(
          "id, position, jersey_number_for_team, is_active, teams(slug), profiles(id, full_name, photo_url, jersey_number, position_primary, nickname, status, role, also_plays_for_steaks)"
        )

      const rows = (data as unknown as MemberRow[]) || []

      // Dedupe by profile id — one card per player, collecting all team tags.
      const byProfile = new Map<string, RosterPlayer>()
      for (const row of rows) {
        const p = row.profiles
        if (!p || p.role === "coach") continue
        const tag = teamTag(row.teams?.slug)
        const existing = byProfile.get(p.id)
        if (existing) {
          if (tag && !existing.teamTags!.includes(tag)) {
            existing.teamTags!.push(tag)
            existing.teamSlugs.push(row.teams?.slug ?? "")
          }
        } else {
          const tags = tag ? [tag] : []
          const slugs = row.teams?.slug ? [row.teams.slug] : []
          byProfile.set(p.id, {
            id: p.id,
            fullName: p.full_name,
            photoUrl: p.photo_url,
            jerseyNumber: row.jersey_number_for_team ?? p.jersey_number,
            position: row.position || p.position_primary,
            status: p.status,
            nickname: p.nickname,
            teamTags: tags,
            teamSlugs: slugs,
          })
        }
      }

      // Honour the Steaks flag even when no team_members row links them.
      for (const player of byProfile.values()) {
        const row = rows.find((r) => r.profiles?.id === player.id)
        if (row?.profiles?.also_plays_for_steaks && !player.teamTags!.includes("Steaks")) {
          player.teamTags!.push("Steaks")
        }
      }

      const list = Array.from(byProfile.values()).sort((a, b) => {
        const ja = a.jerseyNumber ?? 999
        const jb = b.jerseyNumber ?? 999
        if (ja !== jb) return ja - jb
        return a.fullName.localeCompare(b.fullName)
      })

      setPlayers(list)
      setLoading(false)
    }

    fetchRoster()
  }, [])

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchesTeam = filter === "all" || p.teamTags!.includes(filter)
      const matchesSearch =
        !search ||
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (p.nickname ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.position ?? "").toLowerCase().includes(search.toLowerCase())
      return matchesTeam && matchesSearch
    })
  }, [players, filter, search])

  return (
    <>
      {/* Header */}
      <section className="border-b border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="eyebrow text-brand">The Squad</p>
          <h1 className="mt-3 font-heading text-4xl tracking-tight text-ink sm:text-5xl">
            Full Roster
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Every player across the Baltimore Kings program — futsal, arena, and the
            Salisbury Steaks affiliate.
          </p>
        </div>
      </section>

      {/* Controls + grid */}
      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {TEAM_FILTERS.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => setFilter(t.tag)}
                  className={`rounded-full px-4 py-1.5 font-heading text-sm transition-all ${
                    filter === t.tag
                      ? "bg-brand text-paper"
                      : "border border-border bg-white text-ink/70 hover:border-accent/40 hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players..."
                className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm text-ink placeholder:text-muted-foreground focus:border-accent focus:outline-none sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="mt-16 text-center text-muted-foreground">
              Loading roster...
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="mt-6 text-sm text-muted-foreground">
                {filtered.length} player{filtered.length === 1 ? "" : "s"}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((p) => (
                  <PlayerCard key={p.id} player={p} />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-heading text-lg text-ink">No players found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different team filter or search term.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
