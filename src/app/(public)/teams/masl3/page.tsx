import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, ExternalLink, Users } from "lucide-react"

export const metadata = {
  title: "MASL3 Arena Soccer",
  description: "Baltimore Kings MASL3 arena soccer — off-season competition in Major Arena Soccer League 3.",
}

export default async function MASL3Page() {
  const supabase = await createClient()

  // Get the MASL3 team
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", "kings-masl3")
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,169,78,0.08)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-gold">
              Major Arena Soccer League 3
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Baltimore Kings MASL3
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Arena soccer at full speed. Six-a-side, boards, unlimited subs, 60-minute matches.
              The off-season arm of the club — same players, different format.
              We play in the Eastern Conference out of GOALS Baltimore.
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
          <p className="mt-2 text-white/60">Current active players for the MASL3 season.</p>

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

      {/* Last Season Stats — link to MASL3.com */}
      <section className="border-t border-white/10 bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">Last Season</h2>
          <div className="mt-6 max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-white/60">
              Past MASL3 season stats and standings live on masl3.com. Full box scores,
              player leaderboards, and game logs from the previous season.
            </p>
            <a
              href="https://www.masl3.com/stats#/1396/team/593222"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex"
            >
              <Button className="bg-gold font-heading font-semibold text-black hover:bg-gold/90">
                View Last Season on MASL3
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="border-t border-white/10 bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">Schedule</h2>
          <p className="mt-2 text-white/60">All MASL3 matches this season.</p>

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
                        {game.location || "GOALS Baltimore"} &middot;{" "}
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

      {/* Arena Pathway */}
      <section id="pathway" className="border-t border-white/10 bg-[#111111] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Arena Pathway
            </h2>
            <div className="mt-6 space-y-4 text-white/70">
              <p>
                The Baltimore Kings share management with the Salisbury Steaks, our MASL2 affiliate.
                Same front office, same player development philosophy, direct promotion path.
              </p>
              <p>
                Standout MASL3 players get called up to Salisbury for MASL2 matches — no agent needed,
                no tryout circus. Perform here, get promoted there. The coaching staff evaluates every
                game, every practice.
              </p>
              <p>
                The arena ladder: Kings MASL3 → Salisbury Steaks (MASL2) → MASL1 / Baltimore Blast.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/apply">
                <Button className="bg-gold font-heading font-semibold text-black hover:bg-gold/90">
                  Apply now
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
