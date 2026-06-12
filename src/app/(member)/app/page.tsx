import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { fetchMemberNotifications } from "@/lib/member-notifications"
import { DashboardClient, type CoachData, type PlayerData, type QuickLink } from "./dashboard-client"

// basePath handled by next.config.ts

const DEFAULT_QUICK_LINKS: QuickLink[] = [
  { href: "/app/admin/applications", label: "Applications" },
  { href: "/app/admin/fees", label: "Fees" },
  { href: "/app/admin/schedule", label: "Schedule" },
  { href: "/app/admin/training", label: "Training & Tutorials" },
  { href: "/app/admin/roster", label: "Roster Manager" },
  { href: "/app/admin/pages", label: "Pages" },
]

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

  if (!profile) redirect(`/login`)

  const isAdmin = profile.role === "coach" || profile.role === "superadmin"
  const nowIso = new Date().toISOString()

  // Player data — fetched for everyone (coaches who also play can switch views).
  const [notifications, eventsRes, paymentsRes] = await Promise.all([
    fetchMemberNotifications(supabase, user.id),
    supabase
      .from("calendar_events")
      .select("id, title, kind, starts_at, location")
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(5),
    supabase
      .from("payments")
      .select("id, amount_cents, status, purpose, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  const playerData: PlayerData = {
    notifications,
    events: eventsRes.data ?? [],
    recentPayments: paymentsRes.data ?? [],
  }

  let coachData: CoachData | null = null
  if (isAdmin) {
    const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    const today = new Date().toISOString().slice(0, 10)

    const [
      newAppsRes,
      trialingRes,
      outstandingRes,
      pendingTrainingRes,
      failedPaymentsRes,
      views7Res,
      clicks7Res,
      views30Res,
      prefsRes,
    ] = await Promise.all([
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "invited"),
      supabase
        .from("fee_assignments")
        .select("id, fee_items(amount_cents, due_date)")
        .eq("status", "outstanding"),
      supabase
        .from("training_progress")
        .select("*", { count: "exact", head: true })
        .eq("status", "player_marked_complete"),
      supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("created_at", monthAgo),
      supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "view")
        .gte("created_at", weekAgo),
      supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "click")
        .gte("created_at", weekAgo),
      supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "view")
        .gte("created_at", monthAgo),
      supabase.from("dashboard_prefs").select("quick_links").eq("profile_id", user.id).maybeSingle(),
    ])

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const outstanding = (outstandingRes.data ?? []) as any[]
    const outstandingCents = outstanding.reduce(
      (sum, a) => sum + (a.fee_items?.amount_cents ?? 0),
      0,
    )
    const overdueCount = outstanding.filter(
      (a) => a.fee_items?.due_date && a.fee_items.due_date < today,
    ).length
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const savedLinks = (prefsRes.data?.quick_links ?? []) as QuickLink[]

    coachData = {
      newApplications: newAppsRes.count ?? 0,
      trialingPlayers: trialingRes.count ?? 0,
      pendingFeesCount: outstanding.length,
      pendingFeesCents: outstandingCents,
      pendingTrainings: pendingTrainingRes.count ?? 0,
      clubIssues: (failedPaymentsRes.count ?? 0) + overdueCount,
      failedPayments: failedPaymentsRes.count ?? 0,
      overdueFees: overdueCount,
      views7d: views7Res.count ?? 0,
      clicks7d: clicks7Res.count ?? 0,
      views30d: views30Res.count ?? 0,
      quickLinks: savedLinks.length > 0 ? savedLinks : DEFAULT_QUICK_LINKS,
    }
  }

  return (
    <DashboardClient
      firstName={profile.full_name?.split(" ")[0] ?? "Player"}
      isAdmin={isAdmin}
      canSwitchView={isAdmin && !!profile.also_plays}
      playerData={playerData}
      coachData={coachData}
    />
  )
}
