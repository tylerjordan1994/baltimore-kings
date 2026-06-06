import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import { TeamRosterGrid, type TeamRosterEntry } from "@/components/team-roster-grid"

export const metadata = {
  title: "Salisbury Steaks (MASL2)",
  description:
    "The Salisbury Steaks are the Baltimore Kings' Major Arena Soccer League 2 side — part of the club, the top of the arena pathway, drawn from the Kings squads.",
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function SteaksPage() {
  const supabase = await createClient()

  const { data: team } = await supabase.from("teams").select("id").eq("slug", "salisbury-steaks").single()
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
    ? await supabase.from("games").select("*").eq("team_id", teamId).order("starts_at", { ascending: true })
    : { data: null }

  const now = Date.now()
  const allGames = games ?? []
  const upcoming = allGames.filter((g: any) => new Date(g.starts_at).getTime() >= now)
  const past = allGames.filter((g: any) => new Date(g.starts_at).getTime() < now).reverse()

  return (
    <>
      <section className="relative overflow-hidden bg-paper py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 overflow-hidden rounded-2xl">
            <img src="/project/football-team/photos/player-arena.jpg" alt="Salisbury Steaks arena soccer" className="h-auto max-h-[480px] w-full object-cover" />
          </div>
          <div className="max-w-2xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-brand">Major Arena Soccer League 2</p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">Salisbury Steaks</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              The Steaks are the club&apos;s MASL2 side — the top of the arena pathway and the highest level
              the Baltimore Kings compete at. Six-a-side on a walled arena: faster, more physical, a different test.
              This is a club squad, not an affiliate.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/apply">
                <Button size="lg" className="rounded-full bg-accent font-heading font-semibold text-ink hover:bg-accent/90">
                  Try out<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#schedule">
                <Button size="lg" variant="outline" className="rounded-full border-border font-heading font-semibold text-ink hover:bg-paper">
                  View Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">Roster</h2>
          <p className="mt-2 text-muted-foreground">The Steaks draw from across the club&apos;s Kings squads.</p>
          <TeamRosterGrid members={members} />
        </div>
      </section>

      <section id="schedule" className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">Schedule &amp; Results</h2>
          <p className="mt-2 text-muted-foreground">All Salisbury Steaks MASL2 matches.</p>
          {allGames.length > 0 ? (
            <div className="mt-8 space-y-8">
              {upcoming.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wide text-brand">Upcoming</h3>
                  <div className="mt-3 space-y-3">{upcoming.map((g: any) => <GameRow key={g.id} game={g} />)}</div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wide text-brand">Results</h3>
                  <div className="mt-3 space-y-3">{past.map((g: any) => <GameRow key={g.id} game={g} />)}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-heading text-lg font-semibold text-ink">Schedule not yet released</p>
              <p className="mt-1 text-sm text-muted-foreground">Games will be posted once the league finalizes matchups.</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">Where the Steaks fit</h2>
            <div className="mt-6 space-y-4 text-ink/80">
              <p>
                The club fields three squads: <strong>Futsal Kings 1</strong> and <strong>Kings 2</strong> in Pro-SA League 1 futsal,
                and the <strong>Salisbury Steaks</strong> in MASL2. The Steaks are part of the club — not an outside affiliate.
              </p>
              <p>
                On the arena side the club competes in <strong>MASL2 and MASL3 together</strong>: the Steaks at MASL2,
                and a Kings side at MASL3 drawn from both Kings 1 and Kings 2. There is no separate &quot;Kings 2&quot; arena team —
                MASL3 is one Kings group made up of players from across the futsal squads.
              </p>
              <p>
                The arena pathway runs Kings 2 → Kings 1 → Steaks → and, for the best, a shot at MASL1.
                <strong> Baltimore Blast</strong> (MASL1) has scouted from this club before.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/join/pathway">
                <Button className="rounded-full bg-accent font-heading font-semibold text-ink hover:bg-accent/90">
                  The pathway<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function GameRow({ game }: { game: any }) {
  const played = game.score_for != null && game.score_against != null
  const resultColor = game.result === "W" ? "bg-emerald-100 text-emerald-800" : game.result === "L" ? "bg-red-100 text-red-700" : "bg-secondary text-ink"
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white p-4 transition-all hover:border-accent/30">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center rounded-lg bg-paper px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">{new Date(game.starts_at).toLocaleDateString("en-US", { month: "short" })}</span>
          <span className="font-heading text-lg font-bold text-ink">{new Date(game.starts_at).getDate()}</span>
        </div>
        <div>
          <p className="font-heading font-semibold text-ink">{game.home_or_away === "home" ? "vs" : "@"} {game.opponent}</p>
          <p className="text-sm text-muted-foreground">{game.location || "TBA"} &middot; {new Date(game.starts_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {played && <span className="font-heading text-lg font-bold text-accent">{game.score_for}&ndash;{game.score_against}</span>}
        {game.result && <span className={`rounded-full px-2 py-0.5 font-heading text-xs ${resultColor}`}>{game.result}</span>}
      </div>
    </div>
  )
}
