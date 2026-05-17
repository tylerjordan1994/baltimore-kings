import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import { TeamRosterGrid, type TeamRosterEntry } from "@/components/team-roster-grid"

export const metadata = {
  title: "Futsal Kings 2",
  description: "Baltimore Kings Futsal Kings 2 — the development squad. Building the next generation of Kings players through League 1 Futsal competition.",
}

export const dynamic = "force-dynamic"

export default async function FutsalKings2Page() {
  const supabase = await createClient()

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", "futsal-kings-2")
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 overflow-hidden rounded-2xl">
            <img src="/project/football-team/photos/futsal-kings-2.jpg" alt="Futsal Kings 2 team photo" className="w-full h-auto max-h-[480px] object-cover" />
          </div>
          <div className="max-w-2xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-brand">
              Pro-SA Futsal League 1
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Futsal Kings 2
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              The development squad. Same methodology, same pitch, same coaching philosophy
              as the first team. Kings 2 is where players earn their way into the starting
              lineup through consistent performance and dedication.
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
          <p className="mt-2 text-muted-foreground">Current active players for the Futsal Kings 2 season.</p>

          <TeamRosterGrid members={members} />
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">Schedule &amp; Results</h2>
          <p className="mt-2 text-muted-foreground">All Futsal Kings 2 matches this season.</p>

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

      {/* Development Pathway */}
      <section className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Development Pathway
            </h2>
            <div className="mt-6 space-y-4 text-ink/80">
              <p>
                Kings 2 is not a B-team — it is a development environment with a clear promotion
                path. Players who demonstrate consistent quality, tactical understanding, and
                professionalism move up to Kings 1.
              </p>
              <p>
                Both squads train together regularly, share the same tactical framework, and
                compete in League 1 Futsal. The difference is minutes and matchday responsibility
                — not quality of coaching or environment.
              </p>
              <p>
                If you are new to the club, Kings 2 is likely where you start. Earn your place.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/apply">
                <Button className="bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full">
                  Apply for a tryout
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
