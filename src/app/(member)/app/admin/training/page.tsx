"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { FocusArea, FocusCategory, TrainingPriority, Profile, Team, Tutorial } from "@/types/database"

type Tab = "assignments" | "focus_areas" | "completions" | "tutorials"

export default function AdminTrainingPage() {
  const [tab, setTab] = useState<Tab>("assignments")
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([])
  const [players, setPlayers] = useState<Profile[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [completions, setCompletions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Tutorials (merged in from the former admin/tutorials page)
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [showTutorialForm, setShowTutorialForm] = useState(false)
  const [editingTutorialId, setEditingTutorialId] = useState<string | null>(null)
  const [tutTitle, setTutTitle] = useState("")
  const [tutCategory, setTutCategory] = useState("")
  const [tutYoutube, setTutYoutube] = useState("")
  const [tutExternal, setTutExternal] = useState("")
  const [tutBody, setTutBody] = useState("")
  const [tutPublished, setTutPublished] = useState(false)

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

    if (tab === "tutorials") {
      const { data: tut } = await supabase
        .from("tutorials")
        .select("*")
        .order("created_at", { ascending: false })
      setTutorials((tut as Tutorial[]) || [])
    }

    setLoading(false)
  }

  // ── Tutorials CRUD (merged from admin/tutorials) ───────────────
  function resetTutorialForm() {
    setEditingTutorialId(null)
    setTutTitle("")
    setTutCategory("")
    setTutYoutube("")
    setTutExternal("")
    setTutBody("")
    setTutPublished(false)
  }

  async function handleSaveTutorial() {
    const payload = {
      title: tutTitle,
      body_markdown: tutBody || null,
      youtube_url: tutYoutube || null,
      external_url: tutExternal || null,
      category: tutCategory || null,
      is_published: tutPublished,
    }
    if (editingTutorialId) {
      await supabase.from("tutorials").update(payload).eq("id", editingTutorialId)
    } else {
      await supabase.from("tutorials").insert(payload)
    }
    setShowTutorialForm(false)
    resetTutorialForm()
    fetchData()
  }

  function handleEditTutorial(t: Tutorial) {
    setEditingTutorialId(t.id)
    setTutTitle(t.title)
    setTutCategory(t.category ?? "")
    setTutYoutube(t.youtube_url ?? "")
    setTutExternal(t.external_url ?? "")
    setTutBody(t.body_markdown ?? "")
    setTutPublished(t.is_published)
    setShowTutorialForm(true)
  }

  async function handleDeleteTutorial(id: string) {
    if (!confirm("Delete this tutorial?")) return
    await supabase.from("tutorials").delete().eq("id", id)
    fetchData()
  }

  async function toggleTutorialPublish(id: string, current: boolean) {
    await supabase.from("tutorials").update({ is_published: !current }).eq("id", id)
    fetchData()
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
    { key: "tutorials", label: "Tutorials" },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Training &amp; Tutorials</h1>
        <div className="flex gap-2">
          {tab === "tutorials" ? (
            <button
              onClick={() => { resetTutorialForm(); setShowTutorialForm(true) }}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-paper hover:bg-brand-light transition-colors"
            >
              Add Tutorial
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowFocusForm(true)}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-ink hover:bg-zinc-200 transition-colors"
              >
                Add Focus Area
              </button>
              <button
                onClick={() => setShowAssignForm(true)}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-paper hover:bg-brand-light transition-colors"
              >
                Assign Training
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-paper p-1">
        {tabs.map((t) => (
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

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : tab === "focus_areas" ? (
        <div className="space-y-3">
          {focusAreas.length === 0 ? (
            <div className="rounded-xl border border-border bg-white shadow-sm p-6">
              <p className="text-sm text-muted-foreground">No focus areas created yet.</p>
            </div>
          ) : (
            focusAreas.map((fa) => (
              <div key={fa.id} className="rounded-xl border border-border bg-white shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-ink">{fa.name}</h3>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase text-zinc-700">
                    {fa.category}
                  </span>
                </div>
                {fa.description && <p className="mt-1 text-sm text-muted-foreground">{fa.description}</p>}
                {fa.default_for_positions && fa.default_for_positions.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
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
            <div className="rounded-xl border border-border bg-white shadow-sm p-6">
              <p className="text-sm text-muted-foreground">No completions awaiting review.</p>
            </div>
          ) : (
            completions.map((c: any) => (
              <div key={c.id} className="rounded-xl border border-border bg-white shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-ink">{c.profiles?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {c.training_assignments?.focus_areas?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Marked complete: {new Date(c.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirm(c.id)}
                      className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleSendBack(c.id)}
                      className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                    >
                      Send Back
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : tab === "tutorials" ? (
        <div className="space-y-3">
          {tutorials.length === 0 ? (
            <div className="rounded-xl border border-border bg-white shadow-sm p-6">
              <p className="text-sm text-muted-foreground">No tutorials yet.</p>
            </div>
          ) : (
            tutorials.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border bg-white shadow-sm p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{t.title}</span>
                    {t.category && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-700">
                        {t.category}
                      </span>
                    )}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${
                        t.is_published
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {t.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTutorialPublish(t.id, t.is_published)}
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-ink hover:bg-zinc-200 transition-colors"
                  >
                    {t.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleEditTutorial(t)}
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-ink hover:bg-zinc-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTutorial(t.id)}
                    className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white shadow-sm p-6">
          <p className="text-sm text-muted-foreground">
            Use the &quot;Assign Training&quot; button above to create new assignments.
            Focus areas are the building blocks — create those first, then assign them to players or teams.
          </p>
        </div>
      )}

      {/* Tutorial Form Modal */}
      {showTutorialForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white shadow-sm p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-ink mb-4">
              {editingTutorialId ? "Edit Tutorial" : "Add Tutorial"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Title</label>
                <input
                  type="text"
                  value={tutTitle}
                  onChange={(e) => setTutTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Category</label>
                <input
                  type="text"
                  value={tutCategory}
                  onChange={(e) => setTutCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={tutYoutube}
                  onChange={(e) => setTutYoutube(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">External URL</label>
                <input
                  type="text"
                  value={tutExternal}
                  onChange={(e) => setTutExternal(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Body (Markdown)</label>
                <textarea
                  value={tutBody}
                  onChange={(e) => setTutBody(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 font-mono text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tutPublished}
                  onChange={(e) => setTutPublished(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm text-ink/80">Published</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveTutorial}
                  disabled={!tutTitle.trim()}
                  className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-paper hover:bg-brand-light disabled:opacity-50 transition-colors"
                >
                  {editingTutorialId ? "Update" : "Create"}
                </button>
                <button
                  onClick={() => { setShowTutorialForm(false); resetTutorialForm() }}
                  className="rounded-lg bg-zinc-100 px-6 py-2 text-sm font-medium text-ink hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Focus Area Form Modal */}
      {showFocusForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white shadow-sm p-6">
            <h2 className="text-lg font-bold text-ink mb-4">Add Focus Area</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Name</label>
                <input
                  type="text"
                  value={faName}
                  onChange={(e) => setFaName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Description</label>
                <textarea
                  value={faDescription}
                  onChange={(e) => setFaDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Category</label>
                <select
                  value={faCategory}
                  onChange={(e) => setFaCategory(e.target.value as FocusCategory)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                >
                  <option value="technical">Technical</option>
                  <option value="tactical">Tactical</option>
                  <option value="physical">Physical</option>
                  <option value="mental">Mental</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Default for Positions (comma-separated)</label>
                <input
                  type="text"
                  value={faPositions}
                  onChange={(e) => setFaPositions(e.target.value)}
                  placeholder="GK, CB, ST"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateFocusArea}
                  disabled={!faName.trim() || submitting}
                  className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-paper hover:bg-brand-light disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => setShowFocusForm(false)}
                  className="rounded-lg bg-zinc-100 px-6 py-2 text-sm font-medium text-ink hover:bg-zinc-200 transition-colors"
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
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white shadow-sm p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-ink mb-4">Assign Training</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Focus Area</label>
                <select
                  value={assignFocusId}
                  onChange={(e) => setAssignFocusId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select focus area...</option>
                  {focusAreas.map((fa) => (
                    <option key={fa.id} value={fa.id}>{fa.name} ({fa.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Assign To</label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setAssignToType("player")}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${assignToType === "player" ? "bg-brand text-paper" : "bg-zinc-100 text-ink"}`}
                  >
                    Players
                  </button>
                  <button
                    onClick={() => setAssignToType("team")}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${assignToType === "team" ? "bg-brand text-paper" : "bg-zinc-100 text-ink"}`}
                  >
                    Team
                  </button>
                </div>
                {assignToType === "player" ? (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-paper p-2 space-y-1">
                    {players.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-zinc-100">
                        <input
                          type="checkbox"
                          checked={assignPlayerIds.includes(p.id)}
                          onChange={() => togglePlayer(p.id)}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-ink">{p.full_name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <select
                    value={assignTeamId}
                    onChange={(e) => setAssignTeamId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
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
                  <label className="block text-sm font-medium text-ink/80 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={assignDue}
                    onChange={(e) => setAssignDue(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Priority</label>
                  <select
                    value={assignPriority}
                    onChange={(e) => setAssignPriority(e.target.value as TrainingPriority)}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Notes</label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Video URL</label>
                <input
                  type="url"
                  value={assignVideo}
                  onChange={(e) => setAssignVideo(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateAssignment}
                  disabled={!assignFocusId || submitting}
                  className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-paper hover:bg-brand-light disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Assigning..." : "Assign"}
                </button>
                <button
                  onClick={() => setShowAssignForm(false)}
                  className="rounded-lg bg-zinc-100 px-6 py-2 text-sm font-medium text-ink hover:bg-zinc-200 transition-colors"
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
