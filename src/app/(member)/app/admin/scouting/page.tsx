"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Prospect, ProspectPriority } from "@/types/database"

const columns: { key: ProspectPriority; label: string; color: string }[] = [
  { key: "watch", label: "Watch", color: "border-zinc-500/30" },
  { key: "target", label: "Target", color: "border-blue-500/30" },
  { key: "actively_recruiting", label: "Actively Recruiting", color: "border-amber-500/30" },
  { key: "signed", label: "Signed", color: "border-green-500/30" },
  { key: "passed", label: "Passed", color: "border-red-500/30" },
]

export default function AdminScoutingPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    contact: "",
    current_team: "",
    position: "",
    scouted_at: "",
    event: "",
    assessment: "",
    priority: "watch" as ProspectPriority,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchProspects()
  }, [])

  async function fetchProspects() {
    setLoading(true)
    const { data } = await supabase
      .from("prospects")
      .select("*")
      .order("created_at", { ascending: false })
    setProspects((data as Prospect[]) || [])
    setLoading(false)
  }

  async function handleCreate() {
    setSubmitting(true)
    await fetch("/api/admin/scouting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form }),
    })
    setShowForm(false)
    setForm({ full_name: "", contact: "", current_team: "", position: "", scouted_at: "", event: "", assessment: "", priority: "watch" })
    setSubmitting(false)
    fetchProspects()
  }

  async function movePriority(prospectId: string, newPriority: ProspectPriority) {
    await fetch("/api/admin/scouting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_priority", id: prospectId, priority: newPriority }),
    })
    fetchProspects()
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Scouting Pipeline</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
        >
          Add Prospect
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {columns.map((col) => {
            const colProspects = prospects.filter((p) => p.priority === col.key)
            return (
              <div key={col.key} className={`rounded-xl border ${col.color} bg-white/5 p-3`}>
                <h3 className="mb-3 text-sm font-semibold text-white">
                  {col.label}{" "}
                  <span className="text-zinc-500">({colProspects.length})</span>
                </h3>
                <div className="space-y-2">
                  {colProspects.map((p) => (
                    <div key={p.id}>
                      <div
                        onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                        className="cursor-pointer rounded-lg border border-white/10 bg-[#0f0f0f] p-3 hover:border-white/20 transition-colors"
                      >
                        <p className="text-sm font-medium text-white">{p.full_name}</p>
                        <p className="text-xs text-zinc-500">
                          {p.position} {p.current_team && `- ${p.current_team}`}
                        </p>
                        {p.event && (
                          <p className="mt-1 text-[10px] text-zinc-600">Scouted: {p.event}</p>
                        )}
                      </div>
                      {expanded === p.id && (
                        <div className="mt-1 rounded-lg border border-white/10 bg-[#0a0a0a] p-3 space-y-2">
                          {p.assessment && (
                            <p className="text-xs text-zinc-400">{p.assessment}</p>
                          )}
                          {p.contact && (
                            <p className="text-xs text-zinc-500">Contact: {p.contact}</p>
                          )}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {columns
                              .filter((c) => c.key !== p.priority)
                              .map((c) => (
                                <button
                                  key={c.key}
                                  onClick={() => movePriority(p.id, c.key)}
                                  className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300 hover:bg-white/20 transition-colors"
                                >
                                  &rarr; {c.label}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Prospect Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">Add Prospect</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Position</label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Current Team</label>
                  <input
                    type="text"
                    value={form.current_team}
                    onChange={(e) => setForm({ ...form, current_team: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Contact</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Scouted At (date)</label>
                  <input
                    type="date"
                    value={form.scouted_at}
                    onChange={(e) => setForm({ ...form, scouted_at: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Event</label>
                  <input
                    type="text"
                    value={form.event}
                    onChange={(e) => setForm({ ...form, event: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as ProspectPriority })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  {columns.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Assessment</label>
                <textarea
                  value={form.assessment}
                  onChange={(e) => setForm({ ...form, assessment: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!form.full_name.trim() || submitting}
                  className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Adding..." : "Add Prospect"}
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
