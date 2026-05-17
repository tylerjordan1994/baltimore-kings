import { createClient } from "@/lib/supabase/server"
import { Trophy, Star } from "lucide-react"

export const metadata = {
  title: "Achievements | Baltimore Kings",
  description: "Baltimore Kings club achievements and player highlights.",
}

type Achievement = {
  id: string
  title: string
  description: string | null
  category: string | null
  date: string | null
  player_name: string | null
}

export default async function AchievementsPage() {
  const supabase = await createClient()

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("date", { ascending: false })

  const FALLBACK_CLUB_ACHIEVEMENTS: Achievement[] = [
    {
      id: "static-1",
      title: "MASL3 Playoff Hosts",
      description: "Baltimore Kings hosted MASL3 playoffs in Fredericksburg, VA, March 2025.",
      category: "club",
      date: "2025-03-01",
      player_name: null,
    },
    {
      id: "static-2",
      title: "League 1 Futsal Founding Club",
      description: "Founding member of League 1 Futsal — the premier futsal competition in the Mid-Atlantic.",
      category: "club",
      date: "2024-01-01",
      player_name: null,
    },
    {
      id: "static-3",
      title: "PRO-SA Founding Club",
      description: "Founding member of the Pro Soccer Alliance, building the infrastructure for professional indoor soccer in America.",
      category: "club",
      date: "2024-01-01",
      player_name: null,
    },
  ]

  const allAchievements = (achievements as Achievement[]) || []
  const clubAchievements = allAchievements.filter((a) => a.category === "club")
  const playerHighlights = allAchievements.filter((a) => a.category === "player")

  // Use fallback if DB returns empty
  const displayClubAchievements = clubAchievements.length > 0 ? clubAchievements : FALLBACK_CLUB_ACHIEVEMENTS

  return (
    <>
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Achievements
          </h1>
          <p className="mt-2 text-muted-foreground">
            What the club and its players have earned.
          </p>
        </div>
      </section>

      {/* Club Achievements */}
      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink">Club Achievements</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayClubAchievements.map((a) => (
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
                    {a.date && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(a.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </p>
                    )}
                    {a.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Player Highlights */}
      <section className="border-t border-border bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink">Player Highlights</h2>

          {playerHighlights.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playerHighlights.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-border bg-white p-5 transition-all hover:border-accent/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Star className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-ink">{a.title}</p>
                      {a.player_name && (
                        <p className="mt-0.5 text-xs font-medium text-accent">{a.player_name}</p>
                      )}
                      {a.date && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(a.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                          })}
                        </p>
                      )}
                      {a.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
