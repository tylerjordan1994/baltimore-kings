"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { PlayerGoal, GoalStatus, Profile } from "@/types/database"

export default function AdminGoalsPage() {
  const [goals, setGoals] = useState<(PlayerGoal & { profiles?: Profile })[]>([])
  const [players, setPlayers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [goalText, setGoalText] = useState("")
  const [season, setSeason] = useState("")
  const [selectedPlayerId, setSelectedPlayerId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [filterPlayer, setFilterPlayer] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const supabase = createClient()

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    const { data } = await supabase
      .from("player_goals")
      .select("*, profiles:profile_id(*)")
      .order("set_at", { ascending: false })
    setGoals(data || [])

    const { data: playersData } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "active")
      .order("full_name")
    setPlayers(playersData || [])
    setLoading(false)
  }

  async function handleCreate() {
    if (!goalText.trim() || !selectedPlayerId) return
    setSubmitting(true)

    const { error } = await supabase.from("player_goals").insert({
      profile_id: selectedPlayerId,
      goal_text: goalText.trim(),
      season: season || null,
      status: "approved" as GoalStatus,
      set_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (!error) {
      setShowForm(false)
      setGoalText("")
      setSeason("")
      setSelectedPlayerId("")
      load()
    }
    setSubmitting(false)
  }

  async function updateStatus(goalId: string, newStatus: GoalStatus) {
    await supabase
      .from("player_goals")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", goalId)
    load()
  }

  async function deleteGoal(goalId: string) {
    if (!confirm("Delete this goal?")) return
    await supabase.from("player_goals").delete().eq("id", goalId)
    load()
  }

  const statusColors: Record<GoalStatus, string> = {
    proposed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    achieved: "bg-green-500/20 text-green-400 border-green-500/30",
    revised: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    dropped: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  const allStatuses: GoalStatus[] = ["proposed", "approved", "in_progress", "achieved", "revised", "dropped"]

  const filtered = goals
    .filter((g) => !filterPlayer || g.profile_id === filterPlayer)
    .filter((g) => !filterStatus || g.status === filterStatus)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Player Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
        >
          Set Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterPlayer}
          onChange={(e) => setFilterPlayer(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Players</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">No goals found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <div key={g.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">
                      {g.profiles?.full_name || "Unknown"}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${statusColors[g.status]}`}>
                      {g.status.replace(/_/g, " ")}
                    </span>
                    {g.season && <span className="text-xs text-zinc-500">{g.season}</span>}
                  </div>
                  <p className="mt-1 text-sm text-zinc-300">{g.goal_text}</p>
                </div>
                <div className="flex items-center gap-1">
                  {g.status === "proposed" && (
                    <button
                      onClick={() => updateStatus(g.id, "approved")}
                      className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {g.status === "approved" && (
                    <button
                      onClick={() => updateStatus(g.id, "in_progress")}
                      className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/30 transition-colors"
                    >
                      Start
                    </button>
                  )}
                  {g.status === "in_progress" && (
                    <button
                      onClick={() => updateStatus(g.id, "achieved")}
                      className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      Achieved
                    </button>
                  )}
                  {!["achieved", "dropped"].includes(g.status) && (
                    <button
                      onClick={() => updateStatus(g.id, "dropped")}
                      className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      Drop
                    </button>
                  )}
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Set a Player Goal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Player</label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select player...</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Goal</label>
                <textarea
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  rows={3}
                  placeholder="What should this player achieve?"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Season</label>
                <input
                  type="text"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="e.g. 2025-2026"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!goalText.trim() || !selectedPlayerId || submitting}
                  className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Saving..." : "Save Goal"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg bg-zinc-800 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
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
