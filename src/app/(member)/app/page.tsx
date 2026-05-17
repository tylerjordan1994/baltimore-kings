import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const basePath = "/project/football-team"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`${basePath}/login`)

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch teams
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("*, teams(*)")
    .eq("profile_id", user.id)

  // Fetch next upcoming event
  const { data: nextEvent } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  // Outstanding fees
  const { data: outstandingFees } = await supabase
    .from("fee_items")
    .select("*")
    .eq("profile_id", user.id)
    .eq("is_paid", false)

  // Unsigned requirements
  const { data: requirements } = await supabase
    .from("requirements")
    .select("id")
    .eq("is_active", true)

  const { data: signatures } = await supabase
    .from("requirement_signatures")
    .select("requirement_id")
    .eq("profile_id", user.id)

  const signedIds = new Set(signatures?.map((s) => s.requirement_id) ?? [])
  const unsignedCount =
    requirements?.filter((r) => !signedIds.has(r.id)).length ?? 0

  // Recent game results
  const { data: recentGames } = await supabase
    .from("game_participations")
    .select("*, games(*, teams(name))")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const teams = teamMembers?.map((tm) => tm.teams).filter(Boolean) ?? []
  const totalOwed =
    outstandingFees?.reduce((sum, f) => sum + f.amount_cents, 0) ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "Player"}
        </h1>
        <p className="mt-1 text-zinc-400">Here is your dashboard overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Teams"
          value={teams.length.toString()}
          detail={teams.map((t) => t?.name).join(", ") || "None"}
        />
        <StatCard
          label="Outstanding Fees"
          value={`$${(totalOwed / 100).toFixed(2)}`}
          detail={`${outstandingFees?.length ?? 0} unpaid item(s)`}
        />
        <StatCard
          label="Unsigned Requirements"
          value={unsignedCount.toString()}
          detail={unsignedCount > 0 ? "Action needed" : "All signed"}
        />
        <StatCard
          label="Games Played"
          value={(recentGames?.length ?? 0).toString()}
          detail="Recent participations"
        />
      </div>

      {/* Next Event */}
      {nextEvent && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Next Event
          </h2>
          <p className="text-lg font-medium text-white">{nextEvent.title}</p>
          <p className="text-sm text-zinc-400">
            {new Date(nextEvent.starts_at).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
            {nextEvent.location && ` — ${nextEvent.location}`}
          </p>
        </div>
      )}

      {/* Recent Games */}
      {recentGames && recentGames.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Recent Games
          </h2>
          <div className="space-y-2">
            {recentGames.map((gp: any) => (
              <div
                key={gp.id}
                className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-2"
              >
                <div>
                  <span className="text-sm font-medium text-white">
                    vs {gp.games?.opponent}
                  </span>
                  <span className="ml-2 text-xs text-zinc-500">
                    {gp.games?.teams?.name}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-zinc-400">
                  <span>{gp.minutes} min</span>
                  <span>{gp.goals}G</span>
                  <span>{gp.assists}A</span>
                  {gp.games?.result && (
                    <span
                      className={
                        gp.games.result === "W"
                          ? "text-green-400"
                          : gp.games.result === "L"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }
                    >
                      {gp.games.result}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 truncate text-xs text-zinc-400">{detail}</p>
    </div>
  )
}
