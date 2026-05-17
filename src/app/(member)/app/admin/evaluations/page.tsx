"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Evaluation, Profile } from "@/types/database"

export default function AdminEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [players, setPlayers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
    setLoading(false)
  }

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
      <span className="text-amber-400">
        {"★".repeat(value)}{"☆".repeat(5 - value)}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Player Evaluations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
        >
          Create Evaluation
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-zinc-500">No evaluations yet.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([playerName, evals]) => (
          <div key={playerName} className="space-y-2">
            <h2 className="text-lg font-semibold text-white">{playerName}</h2>
            {(evals as any[]).map((ev) => (
              <div key={ev.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span>{new Date(ev.evaluation_date).toLocaleDateString()}</span>
                      {ev.period && <span className="rounded-full bg-white/10 px-2 py-0.5">{ev.period}</span>}
                      {ev.is_shared_with_player && (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-green-400">Shared</span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">Technical:</span>
                        <RatingStars value={ev.technical_rating || 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">Tactical:</span>
                        <RatingStars value={ev.tactical_rating || 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">Physical:</span>
                        <RatingStars value={ev.physical_rating || 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">Mental:</span>
                        <RatingStars value={ev.mental_rating || 0} />
                      </div>
                    </div>
                    {ev.strengths && <p className="mt-2 text-sm text-green-400">Strengths: {ev.strengths}</p>}
                    {ev.areas_for_growth && <p className="text-sm text-amber-400">Growth: {ev.areas_for_growth}</p>}
                    {ev.notes && <p className="mt-1 text-sm text-zinc-500">{ev.notes}</p>}
                  </div>
                  <button
                    onClick={() => toggleShare(ev.id, ev.is_shared_with_player)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
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
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">Create Evaluation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Player</label>
                <select
                  value={form.profile_id}
                  onChange={(e) => setForm({ ...form, profile_id: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select player...</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Period</label>
                <input
                  type="text"
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  placeholder="e.g. Fall 2025"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(["technical", "tactical", "physical", "mental"] as const).map((cat) => (
                  <div key={cat}>
                    <label className="block text-sm font-medium text-zinc-300 mb-1 capitalize">{cat}</label>
                    <select
                      value={form[`${cat}_rating` as keyof typeof form] as number}
                      onChange={(e) => setForm({ ...form, [`${cat}_rating`]: parseInt(e.target.value) })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Strengths</label>
                <textarea
                  value={form.strengths}
                  onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Areas for Growth</label>
                <textarea
                  value={form.areas_for_growth}
                  onChange={(e) => setForm({ ...form, areas_for_growth: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_shared_with_player}
                  onChange={(e) => setForm({ ...form, is_shared_with_player: e.target.checked })}
                  className="rounded border-white/20"
                />
                <span className="text-sm text-zinc-300">Share with player</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!form.profile_id || submitting}
                  className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Creating..." : "Create"}
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
