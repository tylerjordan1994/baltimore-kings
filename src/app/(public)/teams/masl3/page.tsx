import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, ExternalLink } from "lucide-react"
import { TeamRosterGrid, type TeamRosterEntry } from "@/components/team-roster-grid"

export const metadata = {
  title: "MASL3 Arena Soccer",
  description: "Baltimore Kings MASL3 arena soccer — off-season competition in Major Arena Soccer League 3.",
}

export const dynamic = "force-dynamic"

export default async function MASL3Page() {
  const supabase = await createClient()

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", "kings-masl3")
    .single()

  const teamId = team?.id

  const { data: roster } = teamId
    ? await supabase
        .from("team_members")
        .select("id, profile_id, position, jersey_number_for_team, is_active, profiles(full_name, photo_url, position_primary, jersey_number)")
        .eq("team_id", teamId)
    : { data: null }

  const members: TeamRosterEntry[] = (roster ?? [])
    .filter((m: any) => m.is_active !== false && m.profiles)
    .map((m: any) => ({
      id: m.id,
      profileId: m.profile_id,
      fullName: m.profiles?.full_name ?? "TBA",
      photoUrl: m.profiles?.photo_url ?? null,
      jerseyNumber: m.jersey_number_for_team ?? m.profiles?.jersey_number ?? null,
      position: m.position || m.profiles?.position_primary || null,
    }))
    .sort((a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999))

  const { data: games } = teamId
    ? await supabase
        .from("games")
        .select("*")
        .eq("team_id", teamId)
        .order("starts_at", { ascending: true })
    : { data: null }

  const now = Date.now()
  const allGames = games ?? []
  const upcoming = allGames.filter((g: any) => new Date(g.starts_at).getTime() >= now)
  const past = allGames
    .filter((g: any) => new Date(g.starts_at).getTime() < now)
    .reverse()

  return (
    <>
      {/* Hero — huddle photo */}
      <section className="relative overflow-hidden bg-court">
        <img
          src="/project/football-team/photos/masl3-huddle.jpg"
          alt="Baltimore Kings MASL3 team huddle"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-court via-court/70 to-court/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-accent">
              Major Arena Soccer League 3
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-paper sm:text-5xl">
              Baltimore Kings MASL3
            </h1>
            <p className="mt-4 text-lg text-paper/80">
              Arena soccer at full speed. Six-a-side, boards, unlimited subs, 60-minute matches.
              The off-season arm of the club — same players, different format.
              We play in the Eastern Conference out of GOALS Baltimore.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/apply">
                <Button size="lg" className="bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full">
                  Try out
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#schedule">
                <Button size="lg" variant="outline" className="border-paper/30 bg-transparent font-heading font-semibold text-paper hover:bg-paper/10 rounded-full">
                  View Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team photo */}
      <section className="bg-paper py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl">
            <img src="/project/football-team/photos/masl3-huddle.jpg" alt="Baltimore Kings MASL3 team photo" className="w-full h-auto max-h-[440px] object-cover" />
          </div>
        </div>
      </section>

      {/* Roster */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">Roster</h2>
          <p className="mt-2 text-muted-foreground">Current active players for the MASL3 season.</p>

          <TeamRosterGrid members={members} />
        </div>
      </section>

      {/* Last Season Stats — link to MASL3.com */}
      <section className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">Last Season</h2>
          <div className="mt-6 max-w-lg rounded-xl border border-border bg-white p-6">
            <p className="text-muted-foreground">
              Past MASL3 season stats and standings live on masl3.com. Full box scores,
              player leaderboards, and game logs from the previous season.
            </p>
            <a
              href="https://www.masl3.com/stats#/1396/team/593222"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex"
            >
              <Button className="bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full">
                View Last Season on MASL3
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">Schedule &amp; Results</h2>
          <p className="mt-2 text-muted-foreground">All MASL3 matches this season.</p>

          {allGames.length > 0 ? (
            <div className="mt-8 space-y-8">
              {upcoming.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wide text-brand">Upcoming</h3>
                  <div className="mt-3 space-y-3">
                    {upcoming.map((game: any) => (
                      <GameRow key={game.id} game={game} fallbackLocation="GOALS Baltimore" />
                    ))}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wide text-brand">Results</h3>
                  <div className="mt-3 space-y-3">
                    {past.map((game: any) => (
                      <GameRow key={game.id} game={game} fallbackLocation="GOALS Baltimore" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-heading text-lg font-semibold text-ink">Schedule not yet released</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Games will be posted once the league finalizes matchups.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Arena Pathway */}
      <section id="pathway" className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Arena Pathway
            </h2>
            <div className="mt-6 space-y-4 text-ink/80">
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
              <Link href="/teams/pathway">
                <Button variant="outline" className="border-border font-heading font-semibold text-ink hover:bg-paper rounded-full">
                  See the full pathway
                </Button>
              </Link>
              <Link href="/apply">
                <Button className="bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full">
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

function GameRow({ game, fallbackLocation }: { game: any; fallbackLocation: string }) {
  const played = game.score_for != null && game.score_against != null
  const resultColor =
    game.result === "W"
      ? "bg-emerald-100 text-emerald-800"
      : game.result === "L"
        ? "bg-red-100 text-red-700"
        : "bg-secondary text-ink"
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white p-4 transition-all hover:border-accent/30">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center rounded-lg bg-paper px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {new Date(game.starts_at).toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="font-heading text-lg font-bold text-ink">
            {new Date(game.starts_at).getDate()}
          </span>
        </div>
        <div>
          <p className="font-heading font-semibold text-ink">
            {game.home_or_away === "home" ? "vs" : "@"} {game.opponent}
          </p>
          <p className="text-sm text-muted-foreground">
            {game.location || fallbackLocation} &middot;{" "}
            {new Date(game.starts_at).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {played && (
          <span className="font-heading text-lg font-bold text-accent">
            {game.score_for}&ndash;{game.score_against}
          </span>
        )}
        {game.result && (
          <span className={`rounded-full px-2 py-0.5 font-heading text-xs ${resultColor}`}>
            {game.result}
          </span>
        )}
      </div>
    </div>
  )
}
