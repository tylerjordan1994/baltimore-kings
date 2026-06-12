import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Derived member notifications. Nothing is stored: each notification is
 * computed from an outstanding item (unpaid fee, unsigned contract or
 * agreement, incomplete training), so completing the item clears it.
 */
export type MemberNotification = {
  id: string
  kind: "payment" | "contract" | "requirement" | "training"
  title: string
  detail: string | null
  href: string
}

function dollars(cents: number | null | undefined): string {
  return typeof cents === "number" ? `$${(cents / 100).toFixed(2)}` : ""
}

// Supabase joins are loosely typed here; rows are narrowed field-by-field.
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function fetchMemberNotifications(
  supabase: SupabaseClient,
  userId: string,
): Promise<MemberNotification[]> {
  const [feesRes, contractsRes, reqsRes, sigsRes, teamsRes] = await Promise.all([
    supabase
      .from("fee_assignments")
      .select("id, status, fee_items(title, amount_cents)")
      .eq("profile_id", userId)
      .eq("status", "outstanding"),
    supabase
      .from("contract_assignments")
      .select("id, status, contracts(title)")
      .eq("profile_id", userId)
      .eq("status", "pending"),
    supabase.from("requirements").select("id, title, version").eq("is_active", true),
    supabase.from("requirement_signatures").select("requirement_id, version").eq("profile_id", userId),
    supabase.from("team_members").select("team_id").eq("profile_id", userId),
  ])

  const notifications: MemberNotification[] = []

  for (const row of (feesRes.data ?? []) as any[]) {
    notifications.push({
      id: `fee-${row.id}`,
      kind: "payment",
      title: `Payment due: ${row.fee_items?.title ?? "Club fee"}`,
      detail: dollars(row.fee_items?.amount_cents) || null,
      href: "/app/payments",
    })
  }

  for (const row of (contractsRes.data ?? []) as any[]) {
    notifications.push({
      id: `contract-${row.id}`,
      kind: "contract",
      title: `Contract awaiting signature`,
      detail: row.contracts?.title ?? null,
      href: "/app/contracts",
    })
  }

  // A requirement counts as signed only at its current version.
  const signedVersion = new Map<string, number>()
  for (const sig of (sigsRes.data ?? []) as any[]) {
    const cur = signedVersion.get(sig.requirement_id) ?? 0
    if ((sig.version ?? 1) > cur) signedVersion.set(sig.requirement_id, sig.version ?? 1)
  }
  for (const req of (reqsRes.data ?? []) as any[]) {
    if ((signedVersion.get(req.id) ?? 0) < (req.version ?? 1)) {
      notifications.push({
        id: `req-${req.id}`,
        kind: "requirement",
        title: `Agreement to sign`,
        detail: req.title ?? null,
        href: "/app/requirements",
      })
    }
  }

  // Trainings assigned directly or via the player's teams, minus completed ones.
  const teamIds = ((teamsRes.data ?? []) as any[]).map((t) => t.team_id).filter(Boolean)
  const [directRes, teamRes] = await Promise.all([
    supabase
      .from("training_assignments")
      .select("id, focus_areas(name)")
      .eq("assigned_to_profile_id", userId),
    teamIds.length
      ? supabase
          .from("training_assignments")
          .select("id, focus_areas(name)")
          .in("assigned_to_team_id", teamIds)
      : Promise.resolve({ data: [] as any[] }),
  ])
  const assignments = new Map<string, any>()
  for (const a of [...((directRes.data ?? []) as any[]), ...((teamRes.data ?? []) as any[])]) {
    assignments.set(a.id, a)
  }

  if (assignments.size > 0) {
    const { data: progress } = await supabase
      .from("training_progress")
      .select("assignment_id, status")
      .eq("profile_id", userId)
      .in("assignment_id", [...assignments.keys()])
    const done = new Set(
      ((progress ?? []) as any[])
        .filter((p) => p.status === "player_marked_complete" || p.status === "coach_confirmed")
        .map((p) => p.assignment_id),
    )
    for (const [id, a] of assignments) {
      if (!done.has(id)) {
        notifications.push({
          id: `training-${id}`,
          kind: "training",
          title: `Training assigned`,
          detail: a.focus_areas?.name ?? null,
          href: "/app/training",
        })
      }
    }
  }

  return notifications
}
