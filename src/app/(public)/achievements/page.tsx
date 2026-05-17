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

  const allAchievements = (achievements as Achievement[]) || []
  const clubAchievements = allAchievements.filter((a) => a.category === "club")
  const playerHighlights = allAchievements.filter((a) => a.category === "player")

  return (
    <>
      <section className="bg-gradient-to-b from-[#0a0a0a] to-[#141414] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Achievements
          </h1>
          <p className="mt-2 text-white/60">
            What the club and its players have earned.
          </p>
        </div>
      </section>

      {/* Club Achievements */}
      <section className="bg-[#0a0a0a] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">Club Achievements</h2>

          {clubAchievements.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clubAchievements.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-gold/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10">
                      <Trophy className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-white">{a.title}</p>
                      {a.date && (
                        <p className="mt-0.5 text-xs text-white/50">
                          {new Date(a.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                          })}
                        </p>
                      )}
                      {a.description && (
                        <p className="mt-2 text-sm text-white/60">{a.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <Trophy className="mx-auto h-10 w-10 text-white/30" />
              <p className="mt-3 font-heading text-lg font-semibold text-white">Building the trophy case</p>
              <p className="mt-1 text-sm text-white/60">
                First season underway. Achievements will appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Player Highlights */}
      <section className="border-t border-white/10 bg-[#0a0a0a] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">Player Highlights</h2>

          {playerHighlights.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playerHighlights.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-gold/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10">
                      <Star className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-white">{a.title}</p>
                      {a.player_name && (
                        <p className="mt-0.5 text-xs font-medium text-gold">{a.player_name}</p>
                      )}
                      {a.date && (
                        <p className="mt-0.5 text-xs text-white/50">
                          {new Date(a.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                          })}
                        </p>
                      )}
                      {a.description && (
                        <p className="mt-2 text-sm text-white/60">{a.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <Star className="mx-auto h-10 w-10 text-white/30" />
              <p className="mt-3 font-heading text-lg font-semibold text-white">Spotlight coming</p>
              <p className="mt-1 text-sm text-white/60">
                Individual player awards and highlights get posted here after each season.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
