import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users } from "lucide-react"

// basePath handled by next.config.ts

export const metadata = {
  title: "Futsal League 1 | Baltimore Kings",
  description: "Baltimore Kings Pro-SA Futsal League 1 roster, schedule, and team info.",
}

export default async function FutsalL1Page() {
  const supabase = await createClient()

  const { data: roster } = await supabase
    .from("team_members")
    .select("*, profiles(*)")
    .eq("team_slug", "baltimore-kings-futsal-l1")
    .eq("status", "active")
    .order("jersey_number", { ascending: true })

  const { data: games } = await supabase
    .from("games")
    .select("*")
    .eq("team_slug", "baltimore-kings-futsal-l1")
    .order("game_date", { ascending: true })

  return (
    <>
      {/* Hero */}
      <section className="bg-primary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-gold">
              Pro-SA Futsal League 1
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              Baltimore Kings Futsal
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Five-a-side, low-bounce ball, flat court. Pure technique and decision-making at speed.
              We compete in Pro-SA League 1 — the top tier of organized futsal in the Mid-Atlantic.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={`/apply`}>
                <Button size="lg" variant="secondary" className="font-heading font-semibold">
                  Try out
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#schedule">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 font-heading font-semibold text-primary-foreground hover:bg-primary-foreground/10">
                  View Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Roster */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Roster</h2>
          <p className="mt-2 text-muted-foreground">Current active players for the Futsal L1 season.</p>

          {roster && roster.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {roster.map((member) => (
                <div
                  key={member.id}
                  className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-colors hover:border-gold/50"
                >
                  <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto">
                    {member.profiles?.avatar_url ? (
                      <Image
                        src={member.profiles.avatar_url}
                        alt={member.profiles.full_name || "Player"}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-center">
                    {member.jersey_number && (
                      <span className="font-heading text-xs font-bold text-gold">
                        #{member.jersey_number}
                      </span>
                    )}
                    <p className="font-heading text-sm font-semibold leading-tight">
                      {member.profiles?.full_name || "TBA"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {member.position || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 font-heading text-lg font-semibold">Roster coming soon</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tryouts are in progress. Check back for the full squad.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="border-t border-border py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Schedule</h2>
          <p className="mt-2 text-muted-foreground">All Futsal L1 matches this season.</p>

          {games && games.length > 0 ? (
            <div className="mt-8 space-y-3">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center rounded bg-muted px-3 py-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {new Date(game.game_date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="font-heading text-lg font-bold">
                        {new Date(game.game_date).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-heading font-semibold">
                        {game.home_team === "baltimore-kings-futsal-l1" ? "vs" : "@"} {game.opponent || "TBA"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {game.venue || "Benfield Sports"} &middot;{" "}
                        {new Date(game.game_date).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {game.score_home != null && game.score_away != null && (
                    <div className="font-heading text-lg font-bold">
                      {game.score_home}–{game.score_away}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 font-heading text-lg font-semibold">Schedule not yet released</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Games will be posted once the league finalizes matchups.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Futsal */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Why Futsal
            </h2>
            <div className="mt-6 space-y-4 text-foreground/80">
              <p>
                Every top-level indoor player in the world trains futsal. The small court forces
                faster decisions. The low-bounce ball demands cleaner first touches. There is no
                wall to bail you out.
              </p>
              <p>
                Our L1 program runs parallel to the MASL3 team. Many players compete on both
                rosters — futsal sharpens the technical edge that wins arena matches.
              </p>
              <p>
                Training sessions run year-round at Benfield Sports in Millersville.
              </p>
            </div>
            <div className="mt-8">
              <Link href={`/learn`}>
                <Button variant="default" className="font-heading font-semibold">
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
