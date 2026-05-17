"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { PlayerGoal, GoalStatus } from "@/types/database"

export default function GoalsPage() {
  const [goals, setGoals] = useState<PlayerGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [goalText, setGoalText] = useState("")
  const [season, setSeason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data } = await supabase
      .from("player_goals")
      .select("*")
      .eq("profile_id", user.id)
      .order("set_at", { ascending: false })

    setGoals((data as PlayerGoal[]) || [])
    setLoading(false)
  }

  async function handleCreate() {
    if (!userId || !goalText.trim()) return
    setSubmitting(true)

    const { error } = await supabase.from("player_goals").insert({
      profile_id: userId,
      goal_text: goalText.trim(),
      season: season || null,
      status: "proposed",
      set_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (!error) {
      setShowForm(false)
      setGoalText("")
      setSeason("")
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

  const canAdd = goals.filter((g) => !["achieved", "dropped"].includes(g.status)).length < 3

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Goals</h1>
        {canAdd && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
          >
            Set Goal
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : goals.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-zinc-500">No goals set yet. You can set up to 3 active goals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <div key={g.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${statusColors[g.status]}`}>
                      {g.status.replace(/_/g, " ")}
                    </span>
                    {g.season && <span className="text-xs text-zinc-500">{g.season}</span>}
                  </div>
                  <p className="mt-2 text-sm text-white">{g.goal_text}</p>
                  {g.coach_feedback && (
                    <div className="mt-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-2">
                      <p className="text-xs font-medium text-blue-400 mb-0.5">Coach Feedback</p>
                      <p className="text-sm text-zinc-300">{g.coach_feedback}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {g.status === "proposed" && (
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      Remove
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Goal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-6">
            <h2 className="text-lg font-bold text-white mb-4">Set a New Goal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Goal</label>
                <textarea
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  rows={3}
                  placeholder="What do you want to achieve?"
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
                  disabled={!goalText.trim() || submitting}
                  className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Saving..." : "Save Goal"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
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
