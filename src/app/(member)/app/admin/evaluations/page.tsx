"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Evaluation, Profile, PlayerGoal, GoalStatus } from "@/types/database"

type Tab = "evaluations" | "goals"

export default function AdminEvaluationsPage() {
  const [tab, setTab] = useState<Tab>("evaluations")
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [players, setPlayers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Player goals (merged in from the former admin/goals page)
  const [goals, setGoals] = useState<(PlayerGoal & { profiles?: Profile })[]>([])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalText, setGoalText] = useState("")
  const [goalSeason, setGoalSeason] = useState("")
  const [goalPlayerId, setGoalPlayerId] = useState("")
  const [goalFilterPlayer, setGoalFilterPlayer] = useState("")
  const [goalFilterStatus, setGoalFilterStatus] = useState("")

  // Form state
  const [form, setForm] = useState({
    profile_id: "",
    period: "",
    technical_rating: 3,
    tactical_rating: 3,
    physical_rating: 3,
    mental_rating: 3,
    strengths: "",
    areas_for_growth: "",
    notes: "",
    is_shared_with_player: false,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: evals } = await supabase
      .from("evaluations")
      .select("*, profiles:profile_id(full_name)")
      .order("evaluation_date", { ascending: false })
    setEvaluations(evals || [])

    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "active")
      .order("full_name")
    setPlayers((p as Profile[]) || [])

    const { data: goalsData } = await supabase
      .from("player_goals")
      .select("*, profiles:profile_id(*)")
      .order("set_at", { ascending: false })
    setGoals(goalsData || [])

    setLoading(false)
  }

  // ── Player goals CRUD (merged from admin/goals) ────────────────
  async function handleCreateGoal() {
    if (!goalText.trim() || !goalPlayerId) return
    setSubmitting(true)
    const { error } = await supabase.from("player_goals").insert({
      profile_id: goalPlayerId,
      goal_text: goalText.trim(),
      season: goalSeason || null,
      status: "approved" as GoalStatus,
      set_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (!error) {
      setShowGoalForm(false)
      setGoalText("")
      setGoalSeason("")
      setGoalPlayerId("")
      fetchData()
    }
    setSubmitting(false)
  }

  async function updateGoalStatus(goalId: string, newStatus: GoalStatus) {
    await supabase
      .from("player_goals")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", goalId)
    fetchData()
  }

  async function deleteGoal(goalId: string) {
    if (!confirm("Delete this goal?")) return
    await supabase.from("player_goals").delete().eq("id", goalId)
    fetchData()
  }

  const goalStatusColors: Record<GoalStatus, string> = {
    proposed: "bg-zinc-100 text-zinc-700 border-zinc-300",
    approved: "bg-blue-100 text-blue-700 border-blue-300",
    in_progress: "bg-amber-100 text-amber-800 border-amber-300",
    achieved: "bg-green-100 text-green-700 border-green-300",
    revised: "bg-purple-100 text-purple-700 border-purple-300",
    dropped: "bg-red-100 text-red-700 border-red-300",
  }

  const allGoalStatuses: GoalStatus[] = [
    "proposed", "approved", "in_progress", "achieved", "revised", "dropped",
  ]

  const filteredGoals = goals
    .filter((g) => !goalFilterPlayer || g.profile_id === goalFilterPlayer)
    .filter((g) => !goalFilterStatus || g.status === goalFilterStatus)

  async function handleCreate() {
    setSubmitting(true)
    await fetch("/api/admin/evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form }),
    })
    setShowForm(false)
    setForm({
      profile_id: "", period: "", technical_rating: 3, tactical_rating: 3,
      physical_rating: 3, mental_rating: 3, strengths: "", areas_for_growth: "", notes: "", is_shared_with_player: false,
    })
    setSubmitting(false)
    fetchData()
  }

  async function toggleShare(evalId: string, currentValue: boolean) {
    await fetch("/api/admin/evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_share", id: evalId, is_shared_with_player: !currentValue }),
    })
    fetchData()
  }

  // Group evaluations by player
  const grouped = evaluations.reduce((acc: Record<string, any[]>, e: any) => {
    const name = e.profiles?.full_name || "Unknown"
    if (!acc[name]) acc[name] = []
    acc[name].push(e)
    return acc
  }, {})

  function RatingStars({ value }: { value: number }) {
    return (
      <span className="text-accent-dark">
        {"★".repeat(value)}{"☆".repeat(5 - value)}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Evaluations &amp; Goals</h1>
        {tab === "evaluations" ? (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-paper hover:bg-brand-light transition-colors"
          >
            Create Evaluation
          </button>
        ) : (
          <button
            onClick={() => setShowGoalForm(true)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-paper hover:bg-brand-light transition-colors"
          >
            Set Goal
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-paper p-1">
        {([
          { key: "evaluations", label: "Evaluations" },
          { key: "goals", label: "Player Goals" },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-brand text-paper" : "text-muted-foreground hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "goals" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={goalFilterPlayer}
              onChange={(e) => setGoalFilterPlayer(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Players</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
            <select
              value={goalFilterStatus}
              onChange={(e) => setGoalFilterStatus(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              {allGoalStatuses.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filteredGoals.length === 0 ? (
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">No goals found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGoals.map((g) => (
                <div key={g.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-ink">
                          {g.profiles?.full_name || "Unknown"}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${goalStatusColors[g.status]}`}>
                          {g.status.replace(/_/g, " ")}
                        </span>
                        {g.season && <span className="text-xs text-muted-foreground">{g.season}</span>}
                      </div>
                      <p className="mt-1 text-sm text-ink/80">{g.goal_text}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {g.status === "proposed" && (
                        <button
                          onClick={() => updateGoalStatus(g.id, "approved")}
                          className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {g.status === "approved" && (
                        <button
                          onClick={() => updateGoalStatus(g.id, "in_progress")}
                          className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {g.status === "in_progress" && (
                        <button
                          onClick={() => updateGoalStatus(g.id, "achieved")}
                          className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors"
                        >
                          Achieved
                        </button>
                      )}
                      {!["achieved", "dropped"].includes(g.status) && (
                        <button
                          onClick={() => updateGoalStatus(g.id, "dropped")}
                          className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                        >
                          Drop
                        </button>
                      )}
                      <button
                        onClick={() => deleteGoal(g.id)}
                        className="rounded-lg bg-paper px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-zinc-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">No evaluations yet.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([playerName, evals]) => (
          <div key={playerName} className="space-y-2">
            <h2 className="text-lg font-semibold text-ink">{playerName}</h2>
            {(evals as any[]).map((ev) => (
              <div key={ev.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(ev.evaluation_date).toLocaleDateString()}</span>
                      {ev.period && <span className="rounded-full bg-paper px-2 py-0.5">{ev.period}</span>}
                      {ev.is_shared_with_player && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">Shared</span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Technical:</span>
                        <RatingStars value={ev.technical_rating || 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Tactical:</span>
                        <RatingStars value={ev.tactical_rating || 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Physical:</span>
                        <RatingStars value={ev.physical_rating || 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Mental:</span>
                        <RatingStars value={ev.mental_rating || 0} />
                      </div>
                    </div>
                    {ev.strengths && <p className="mt-2 text-sm text-green-700">Strengths: {ev.strengths}</p>}
                    {ev.areas_for_growth && <p className="text-sm text-accent-dark">Growth: {ev.areas_for_growth}</p>}
                    {ev.notes && <p className="mt-1 text-sm text-muted-foreground">{ev.notes}</p>}
                  </div>
                  <button
                    onClick={() => toggleShare(ev.id, ev.is_shared_with_player)}
                    className="rounded-lg bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-zinc-200 transition-colors"
                  >
                    {ev.is_shared_with_player ? "Unshare" : "Share"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-ink mb-4">Create Evaluation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Player</label>
                <select
                  value={form.profile_id}
                  onChange={(e) => setForm({ ...form, profile_id: e.target.value })}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select player...</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Period</label>
                <input
                  type="text"
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  placeholder="e.g. Fall 2025"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(["technical", "tactical", "physical", "mental"] as const).map((cat) => (
                  <div key={cat}>
                    <label className="block text-sm font-medium text-ink/80 mb-1 capitalize">{cat}</label>
                    <select
                      value={form[`${cat}_rating` as keyof typeof form] as number}
                      onChange={(e) => setForm({ ...form, [`${cat}_rating`]: parseInt(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Strengths</label>
                <textarea
                  value={form.strengths}
                  onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Areas for Growth</label>
                <textarea
                  value={form.areas_for_growth}
                  onChange={(e) => setForm({ ...form, areas_for_growth: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_shared_with_player}
                  onChange={(e) => setForm({ ...form, is_shared_with_player: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm text-ink/80">Share with player</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!form.profile_id || submitting}
                  className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-paper hover:bg-brand-light disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg bg-paper px-6 py-2 text-sm font-medium text-ink hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink mb-4">Set a Player Goal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Player</label>
                <select
                  value={goalPlayerId}
                  onChange={(e) => setGoalPlayerId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select player...</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Goal</label>
                <textarea
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  rows={3}
                  placeholder="What should this player achieve?"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Season</label>
                <input
                  type="text"
                  value={goalSeason}
                  onChange={(e) => setGoalSeason(e.target.value)}
                  placeholder="e.g. 2025-2026"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateGoal}
                  disabled={!goalText.trim() || !goalPlayerId || submitting}
                  className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-paper hover:bg-brand-light disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Saving..." : "Save Goal"}
                </button>
                <button
                  onClick={() => setShowGoalForm(false)}
                  className="rounded-lg bg-paper px-6 py-2 text-sm font-medium text-ink hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
