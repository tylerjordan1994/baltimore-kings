"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { FocusArea, FocusCategory, TrainingPriority, Profile, Team } from "@/types/database"

type Tab = "assignments" | "focus_areas" | "completions"

export default function AdminTrainingPage() {
  const [tab, setTab] = useState<Tab>("assignments")
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([])
  const [players, setPlayers] = useState<Profile[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [completions, setCompletions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Focus area form
  const [showFocusForm, setShowFocusForm] = useState(false)
  const [faName, setFaName] = useState("")
  const [faDescription, setFaDescription] = useState("")
  const [faCategory, setFaCategory] = useState<FocusCategory>("technical")
  const [faPositions, setFaPositions] = useState("")

  // Assignment form
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [assignFocusId, setAssignFocusId] = useState("")
  const [assignToType, setAssignToType] = useState<"player" | "team">("player")
  const [assignPlayerIds, setAssignPlayerIds] = useState<string[]>([])
  const [assignTeamId, setAssignTeamId] = useState("")
  const [assignDue, setAssignDue] = useState("")
  const [assignPriority, setAssignPriority] = useState<TrainingPriority>("normal")
  const [assignNotes, setAssignNotes] = useState("")
  const [assignVideo, setAssignVideo] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [tab])

  async function fetchData() {
    setLoading(true)
    const { data: fa } = await supabase.from("focus_areas").select("*").order("name")
    setFocusAreas((fa as FocusArea[]) || [])

    const { data: p } = await supabase.from("profiles").select("*").eq("status", "active").order("full_name")
    setPlayers((p as Profile[]) || [])

    const { data: t } = await supabase.from("teams").select("*").eq("is_active", true).order("name")
    setTeams((t as Team[]) || [])

    if (tab === "completions") {
      const { data: prog } = await supabase
        .from("training_progress")
        .select("*, profiles:profile_id(full_name), training_assignments:assignment_id(*, focus_areas(name))")
        .eq("status", "player_marked_complete")
        .order("updated_at", { ascending: false })
      setCompletions(prog || [])
    }

    setLoading(false)
  }

  async function handleCreateFocusArea() {
    setSubmitting(true)
    await fetch("/api/admin/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_focus_area",
        name: faName,
        description: faDescription || null,
        category: faCategory,
        default_for_positions: faPositions ? faPositions.split(",").map((s) => s.trim()) : [],
      }),
    })
    setShowFocusForm(false)
    setFaName("")
    setFaDescription("")
    setSubmitting(false)
    fetchData()
  }

  async function handleCreateAssignment() {
    setSubmitting(true)
    const payload: any = {
      action: "create_assignment",
      focus_area_id: assignFocusId,
      notes_markdown: assignNotes || null,
      due_by: assignDue || null,
      priority: assignPriority,
      attached_youtube_url: assignVideo || null,
    }

    if (assignToType === "team") {
      payload.assigned_to_team_id = assignTeamId
    } else {
      payload.profile_ids = assignPlayerIds
    }

    await fetch("/api/admin/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setShowAssignForm(false)
    setAssignPlayerIds([])
    setAssignFocusId("")
    setAssignNotes("")
    setAssignVideo("")
    setAssignDue("")
    setSubmitting(false)
    fetchData()
  }

  async function handleConfirm(progressId: string) {
    await fetch("/api/admin/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm_completion", progress_id: progressId }),
    })
    fetchData()
  }

  async function handleSendBack(progressId: string) {
    await fetch("/api/admin/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send_back", progress_id: progressId }),
    })
    fetchData()
  }

  function togglePlayer(id: string) {
    setAssignPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "assignments", label: "Assign Training" },
    { key: "focus_areas", label: "Focus Areas" },
    { key: "completions", label: "Review Completions" },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Training Manager</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFocusForm(true)}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            Add Focus Area
          </button>
          <button
            onClick={() => setShowAssignForm(true)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
          >
            Assign Training
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-white/5 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-amber-500 text-black" : "text-white/60 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : tab === "focus_areas" ? (
        <div className="space-y-3">
          {focusAreas.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-zinc-500">No focus areas created yet.</p>
            </div>
          ) : (
            focusAreas.map((fa) => (
              <div key={fa.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{fa.name}</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase text-zinc-400">
                    {fa.category}
                  </span>
                </div>
                {fa.description && <p className="mt-1 text-sm text-zinc-400">{fa.description}</p>}
                {fa.default_for_positions.length > 0 && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Positions: {fa.default_for_positions.join(", ")}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      ) : tab === "completions" ? (
        <div className="space-y-3">
          {completions.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-zinc-500">No completions awaiting review.</p>
            </div>
          ) : (
            completions.map((c: any) => (
              <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{c.profiles?.full_name}</h3>
                    <p className="text-sm text-zinc-400">
                      {c.training_assignments?.focus_areas?.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Marked complete: {new Date(c.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirm(c.id)}
                      className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleSendBack(c.id)}
                      className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      Send Back
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-zinc-400">
            Use the &quot;Assign Training&quot; button above to create new assignments.
            Focus areas are the building blocks — create those first, then assign them to players or teams.
          </p>
        </div>
      )}

      {/* Focus Area Form Modal */}
      {showFocusForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-6">
            <h2 className="text-lg font-bold text-white mb-4">Add Focus Area</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
                <input
                  type="text"
                  value={faName}
                  onChange={(e) => setFaName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  value={faDescription}
                  onChange={(e) => setFaDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Category</label>
                <select
                  value={faCategory}
                  onChange={(e) => setFaCategory(e.target.value as FocusCategory)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="technical">Technical</option>
                  <option value="tactical">Tactical</option>
                  <option value="physical">Physical</option>
                  <option value="mental">Mental</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Default for Positions (comma-separated)</label>
                <input
                  type="text"
                  value={faPositions}
                  onChange={(e) => setFaPositions(e.target.value)}
                  placeholder="GK, CB, ST"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateFocusArea}
                  disabled={!faName.trim() || submitting}
                  className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => setShowFocusForm(false)}
                  className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Form Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">Assign Training</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Focus Area</label>
                <select
                  value={assignFocusId}
                  onChange={(e) => setAssignFocusId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select focus area...</option>
                  {focusAreas.map((fa) => (
                    <option key={fa.id} value={fa.id}>{fa.name} ({fa.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Assign To</label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setAssignToType("player")}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${assignToType === "player" ? "bg-amber-500 text-black" : "bg-white/10 text-white"}`}
                  >
                    Players
                  </button>
                  <button
                    onClick={() => setAssignToType("team")}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${assignToType === "team" ? "bg-amber-500 text-black" : "bg-white/10 text-white"}`}
                  >
                    Team
                  </button>
                </div>
                {assignToType === "player" ? (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-2 space-y-1">
                    {players.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-white/5">
                        <input
                          type="checkbox"
                          checked={assignPlayerIds.includes(p.id)}
                          onChange={() => togglePlayer(p.id)}
                          className="rounded border-white/20"
                        />
                        <span className="text-sm text-white">{p.full_name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <select
                    value={assignTeamId}
                    onChange={(e) => setAssignTeamId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Select team...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={assignDue}
                    onChange={(e) => setAssignDue(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Priority</label>
                  <select
                    value={assignPriority}
                    onChange={(e) => setAssignPriority(e.target.value as TrainingPriority)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Notes</label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Video URL</label>
                <input
                  type="url"
                  value={assignVideo}
                  onChange={(e) => setAssignVideo(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateAssignment}
                  disabled={!assignFocusId || submitting}
                  className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Assigning..." : "Assign"}
                </button>
                <button
                  onClick={() => setShowAssignForm(false)}
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
