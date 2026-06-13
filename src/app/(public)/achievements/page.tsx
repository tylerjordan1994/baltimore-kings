import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Trophy, Star } from "lucide-react"

export const metadata = {
  title: "Achievements | Baltimore Kings",
  description: "Baltimore Kings club achievements and player highlights.",
}

type ProfileRef = {
  full_name: string | null
  photo_url: string | null
  slug: string | null
}

type Achievement = {
  id: string
  kind: "club" | "player"
  profile_id: string | null
  title: string
  description: string | null
  achievement_date: string | null
  season: string | null
  photo_url: string | null
  team_id: string | null
  profiles: ProfileRef | null
}

function formatAchievementDate(date: string | null): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })
}

export default async function AchievementsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("achievements")
    .select(
      "id, kind, profile_id, title, description, achievement_date, season, photo_url, team_id, profiles:profile_id(full_name, photo_url, slug)"
    )
    .eq("is_archived", false)
    .order("achievement_date", { ascending: false, nullsFirst: false })
    .order("display_order", { ascending: true })

  const FALLBACK_CLUB_ACHIEVEMENTS: Achievement[] = [
    {
      id: "static-1",
      kind: "club",
      profile_id: null,
      title: "MASL3 Playoff Hosts",
      description: "Baltimore Kings hosted MASL3 playoffs in Fredericksburg, VA, March 2025.",
      achievement_date: "2025-03-01",
      season: null,
      photo_url: null,
      team_id: null,
      profiles: null,
    },
    {
      id: "static-2",
      kind: "club",
      profile_id: null,
      title: "League 1 Futsal Founding Club",
      description: "Founding member of League 1 Futsal — the premier futsal competition in the Mid-Atlantic.",
      achievement_date: "2012-01-01",
      season: null,
      photo_url: null,
      team_id: null,
      profiles: null,
    },
    {
      id: "static-3",
      kind: "club",
      profile_id: null,
      title: "PRO-SA Founding Club",
      description: "Founding member of the Pro Soccer Alliance, building the infrastructure for professional indoor soccer in America.",
      achievement_date: "2012-01-01",
      season: null,
      photo_url: null,
      team_id: null,
      profiles: null,
    },
  ]

  const allAchievements = (data as unknown as Achievement[]) || []
  const clubAchievements = allAchievements.filter((a) => a.kind === "club")
  const playerHighlights = allAchievements.filter((a) => a.kind === "player")

  // Use fallback if DB returns no club achievements
  const displayClubAchievements =
    clubAchievements.length > 0 ? clubAchievements : FALLBACK_CLUB_ACHIEVEMENTS

  return (
    <>
      <section className="relative overflow-hidden bg-court py-20 sm:py-24">
        <img
          src="/project/football-team/photos/futsal-kings-combined.jpg"
          alt="Baltimore Kings"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Achievements
          </h1>
          <p className="mt-2 text-white/80">
            What the club and its players have earned.
          </p>
        </div>
      </section>

      {/* Club Achievements */}
      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink">Club Achievements</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayClubAchievements.map((a) => {
              const dateLabel = formatAchievementDate(a.achievement_date)
              return (
                <div
                  key={a.id}
                  className="rounded-xl border border-border bg-white p-5 transition-all hover:border-accent/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Trophy className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-ink">{a.title}</p>
                      {(dateLabel || a.season) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[dateLabel, a.season].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {a.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section className="bg-paper px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <img src="/project/football-team/photos/player-arena.jpg" alt="Player in arena" className="h-32 w-full rounded-xl object-cover sm:h-44" />
            <img src="/project/football-team/photos/masl3-huddle.jpg" alt="MASL3 team" className="h-32 w-full rounded-xl object-cover sm:h-44" />
            <img src="/project/football-team/photos/futsal-kings-1-alt.jpg" alt="Futsal Kings" className="h-32 w-full rounded-xl object-cover sm:h-44" />
            <img src="/project/football-team/photos/ball-red-goal.jpg" alt="Goal moment" className="h-32 w-full rounded-xl object-cover sm:h-44" />
          </div>
        </div>
      </section>

      {/* Player Highlights */}
      <section className="border-t border-border bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink">Player Highlights</h2>

          {playerHighlights.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {playerHighlights.map((a) => {
                const dateLabel = formatAchievementDate(a.achievement_date)
                const playerName = a.profiles?.full_name ?? null
                const cardImage = a.photo_url ?? a.profiles?.photo_url ?? null

                const card = (
                  <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:border-accent/30">
                    {cardImage ? (
                      <div className="aspect-[4/3] w-full overflow-hidden bg-paper">
                        <img
                          src={cardImage}
                          alt={playerName ?? a.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center bg-accent/10">
                        <Star className="h-10 w-10 text-accent" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="font-heading font-semibold text-ink">{a.title}</p>
                      {playerName && (
                        <p className="mt-1 text-sm font-semibold text-accent">{playerName}</p>
                      )}
                      {(dateLabel || a.season) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[dateLabel, a.season].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {a.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                      )}
                    </div>
                  </div>
                )

                return a.profile_id ? (
                  <Link key={a.id} href={`/roster/${a.profile_id}`} className="block h-full">
                    {card}
                  </Link>
                ) : (
                  <div key={a.id} className="h-full">
                    {card}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center">
              <Star className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-heading text-lg font-semibold text-ink">Spotlight coming</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Individual player awards and highlights get posted here after each season.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
