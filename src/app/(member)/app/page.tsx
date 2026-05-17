import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

// basePath handled by next.config.ts

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login`)

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
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Hello, {profile?.full_name?.split(" ")[0] ?? "Player"}
        </h1>
        <p className="mt-1 text-white/50">Here is your dashboard overview.</p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="◆"
          label="Teams"
          value={teams.length.toString()}
          detail={teams.map((t) => t?.name).join(", ") || "None"}
        />
        <StatCard
          icon="▶"
          label="Upcoming Events"
          value={nextEvent ? "1" : "0"}
          detail={nextEvent ? nextEvent.title : "Nothing scheduled"}
        />
        <StatCard
          icon="◈"
          label="Outstanding Fees"
          value={`$${(totalOwed / 100).toFixed(0)}`}
          detail={`${outstandingFees?.length ?? 0} unpaid item(s)`}
        />
        <StatCard
          icon="▣"
          label="Games Played"
          value={(recentGames?.length ?? 0).toString()}
          detail="Recent participations"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Next Up */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400/80">
              Next Up
            </h2>
            {nextEvent ? (
              <div>
                <p className="text-lg font-medium text-white">{nextEvent.title}</p>
                <p className="mt-1 text-sm text-white/50">
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
            ) : (
              <p className="text-sm text-white/40">No upcoming events scheduled.</p>
            )}
          </div>

          {/* Recent Games */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400/80">
              Recent Games
            </h2>
            {recentGames && recentGames.length > 0 ? (
              <div className="space-y-2">
                {recentGames.map((gp: any) => (
                  <div
                    key={gp.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5"
                  >
                    <div>
                      <span className="text-sm font-medium text-white">
                        vs {gp.games?.opponent}
                      </span>
                      <span className="ml-2 text-xs text-white/30">
                        {gp.games?.teams?.name}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-white/40">
                      <span>{gp.minutes} min</span>
                      <span>{gp.goals}G</span>
                      <span>{gp.assists}A</span>
                      {gp.games?.result && (
                        <span
                          className={
                            gp.games.result === "W"
                              ? "font-medium text-green-400"
                              : gp.games.result === "L"
                                ? "font-medium text-red-400"
                                : "font-medium text-yellow-400"
                          }
                        >
                          {gp.games.result}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No recent games recorded.</p>
            )}
          </div>
        </div>

        {/* Right Column - Action Required */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400/80">
              Action Required
            </h2>
            <div className="space-y-3">
              {unsignedCount > 0 && (
                <Link
                  href="/app/requirements"
                  className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 transition-colors hover:bg-amber-500/10"
                >
                  <div>
                    <p className="text-sm font-medium text-white">Unsigned Requirements</p>
                    <p className="text-xs text-white/40">
                      {unsignedCount} document(s) need your signature
                    </p>
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                    {unsignedCount}
                  </span>
                </Link>
              )}

              {totalOwed > 0 && (
                <Link
                  href="/app/payments"
                  className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 transition-colors hover:bg-red-500/10"
                >
                  <div>
                    <p className="text-sm font-medium text-white">Unpaid Fees</p>
                    <p className="text-xs text-white/40">
                      ${(totalOwed / 100).toFixed(2)} outstanding
                    </p>
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                    {outstandingFees?.length ?? 0}
                  </span>
                </Link>
              )}

              {unsignedCount === 0 && totalOwed === 0 && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3">
                  <p className="text-sm font-medium text-green-400">All clear</p>
                  <p className="text-xs text-white/40">No outstanding actions required.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="mb-2 text-lg opacity-40">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-sm text-white/50">{label}</p>
      <p className="mt-1 truncate text-xs text-white/30">{detail}</p>
    </div>
  )
}
