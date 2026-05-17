import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import { TeamRosterGrid, type TeamRosterEntry } from "@/components/team-roster-grid"

export const metadata = {
  title: "Futsal Kings 1",
  description: "Baltimore Kings Pro-SA Futsal Kings 1 — the core of the club. Year-round development, technical precision, League 1 competition.",
}

export default async function FutsalKings1Page() {
  const supabase = await createClient()

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", "futsal-kings-1")
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
    .sort((a: TeamRosterEntry, b: TeamRosterEntry) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999))

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
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 overflow-hidden rounded-2xl">
            <img src="/project/football-team/photos/futsal-kings-1.jpg" alt="Futsal Kings 1 team photo" className="w-full h-auto max-h-[480px] object-cover" />
          </div>
          <div className="max-w-2xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-brand">
              Pro-SA Futsal League 1
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Futsal Kings 1
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              This is the core of the club. Five-a-side, low-bounce ball, flat court.
              Pure technique and decision-making at speed. Year-round development,
              League 1 competition, and the technical foundation everything else builds on.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/apply">
                <Button size="lg" className="bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full">
                  Try out
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#schedule">
                <Button size="lg" variant="outline" className="border-border font-heading font-semibold text-ink hover:bg-paper rounded-full">
                  View Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Roster */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">Roster</h2>
          <p className="mt-2 text-muted-foreground">Current active players for the Futsal Kings 1 season.</p>

          <TeamRosterGrid members={members} />
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">Schedule &amp; Results</h2>
          <p className="mt-2 text-muted-foreground">All Futsal Kings 1 matches this season.</p>

          {allGames.length > 0 ? (
            <div className="mt-8 space-y-8">
              {upcoming.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wide text-brand">Upcoming</h3>
                  <div className="mt-3 space-y-3">
                    {upcoming.map((game: any) => (
                      <GameRow key={game.id} game={game} fallbackLocation="Benfield Sportscenter" />
                    ))}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wide text-brand">Results</h3>
                  <div className="mt-3 space-y-3">
                    {past.map((game: any) => (
                      <GameRow key={game.id} game={game} fallbackLocation="Benfield Sportscenter" />
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

      {/* Why Futsal */}
      <section className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Why Futsal
            </h2>
            <div className="mt-6 space-y-4 text-ink/80">
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
              <Link href="/join/development">
                <Button className="bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full">
                  Player development
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
