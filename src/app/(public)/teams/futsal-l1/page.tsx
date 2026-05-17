import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users } from "lucide-react"

export const metadata = {
  title: "Futsal League 1",
  description: "Baltimore Kings Pro-SA Futsal League 1 — the core of the club. Year-round development, technical precision, League 1 competition.",
}

export default async function FutsalL1Page() {
  const supabase = await createClient()

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", "baltimore-kings-futsal-l1")
    .single()

  const teamId = team?.id

  const { data: roster } = teamId
    ? await supabase
        .from("team_members")
        .select("*, profiles(full_name, photo_url, position_primary, jersey_number, role, also_plays)")
        .eq("team_id", teamId)
    : { data: null }

  const { data: games } = teamId
    ? await supabase
        .from("games")
        .select("*")
        .eq("team_id", teamId)
        .order("starts_at", { ascending: true })
    : { data: null }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#141414] py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(201,169,78,0.12)_0%,_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-gold">
              Pro-SA Futsal League 1
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Baltimore Kings Futsal
            </h1>
            <p className="mt-4 text-lg text-white/70">
              This is the core of the club. Five-a-side, low-bounce ball, flat court.
              Pure technique and decision-making at speed. Year-round development,
              League 1 competition, and the technical foundation everything else builds on.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/apply">
                <Button size="lg" className="bg-gold font-heading font-semibold text-black hover:bg-gold/90">
                  Try out
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#schedule">
                <Button size="lg" variant="outline" className="border-white/20 font-heading font-semibold text-white hover:bg-white/[0.07]">
                  View Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Roster */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">Roster</h2>
          <p className="mt-2 text-white/60">Current active players for the Futsal L1 season.</p>

          {roster && roster.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {roster.map((member: any) => (
                <div
                  key={member.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-gold/30"
                >
                  <div className="mb-3 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                    {member.profiles?.photo_url ? (
                      <img
                        src={member.profiles.photo_url}
                        alt={member.profiles.full_name || "Player"}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-white/40" />
                    )}
                  </div>
                  <div className="text-center">
                    {member.jersey_number_for_team != null && (
                      <span className="font-heading text-xs font-bold text-gold">
                        #{member.jersey_number_for_team}
                      </span>
                    )}
                    <p className="font-heading text-sm font-semibold leading-tight text-white">
                      {member.profiles?.full_name || "TBA"}
                    </p>
                    <p className="mt-0.5 text-xs text-white/60">
                      {member.profiles?.position_primary || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <Users className="mx-auto h-10 w-10 text-white/30" />
              <p className="mt-3 font-heading text-lg font-semibold text-white">Roster coming soon</p>
              <p className="mt-1 text-sm text-white/60">
                Tryouts are in progress. Check back for the full squad.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="border-t border-white/10 bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">Schedule</h2>
          <p className="mt-2 text-white/60">All Futsal L1 matches this season.</p>

          {games && games.length > 0 ? (
            <div className="mt-8 space-y-3">
              {games.map((game: any) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-gold/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center rounded-lg bg-white/5 px-3 py-1.5">
                      <span className="text-xs font-medium text-white/60">
                        {new Date(game.starts_at).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="font-heading text-lg font-bold text-white">
                        {new Date(game.starts_at).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-white">
                        {game.home_or_away === "home" ? "vs" : "@"} {game.opponent}
                      </p>
                      <p className="text-sm text-white/60">
                        {game.location || "Benfield Sportscenter"} &middot;{" "}
                        {new Date(game.starts_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {game.score_for != null && game.score_against != null && (
                    <div className="font-heading text-lg font-bold text-gold">
                      {game.score_for}–{game.score_against}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-white/30" />
              <p className="mt-3 font-heading text-lg font-semibold text-white">Schedule not yet released</p>
              <p className="mt-1 text-sm text-white/60">
                Games will be posted once the league finalizes matchups.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Why Futsal */}
      <section className="border-t border-white/10 bg-[#111111] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Why Futsal
            </h2>
            <div className="mt-6 space-y-4 text-white/70">
              <p>
                Every top-level indoor player in the world trains futsal. The small court forces
                faster decisions. The low-bounce ball demands cleaner first touches. There is no
                wall to bail you out.
              </p>
              <p>
                This is the primary program. Arena (MASL3) runs in the off-season for players
                who want both formats — but the technical foundation is built here, on the futsal court.
              </p>
              <p>
                The futsal pathway goes further than arena: Kings L1F → national-level futsal competitions,
                professional futsal clubs domestically and internationally. The club develops players
                for that trajectory.
              </p>
              <p>
                Training sessions run year-round at Benfield Sportscenter in Severna Park.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/learn">
                <Button className="bg-gold font-heading font-semibold text-black hover:bg-gold/90">
                  Futsal tutorials
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
