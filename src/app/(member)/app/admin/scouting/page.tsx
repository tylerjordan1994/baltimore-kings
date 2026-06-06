"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Prospect, ProspectPriority } from "@/types/database"
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { PositionPicker } from "@/components/position-picker"
import { FUTSAL_POSITIONS, ARENA_POSITIONS } from "@/lib/positions"

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
    futsal_positions: [] as string[],
    arena_positions: [] as string[],
  })
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

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
    const res = await fetch("/api/admin/scouting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form }),
    })
    setSubmitting(false)
    if (!res.ok) { alert(`Could not add prospect: ${(await res.json().catch(() => ({}))).error ?? res.statusText}`); return }
    setShowForm(false)
    setForm({ full_name: "", contact: "", current_team: "", position: "", scouted_at: "", event: "", assessment: "", priority: "watch", futsal_positions: [], arena_positions: [] })
    fetchProspects()
  }

  async function movePriority(prospectId: string, newPriority: ProspectPriority) {
    // Optimistic: reflect the move immediately, revert if the save fails.
    const prev = prospects
    setProspects((ps) => ps.map((p) => (p.id === prospectId ? { ...p, priority: newPriority } : p)))
    const res = await fetch("/api/admin/scouting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_priority", id: prospectId, priority: newPriority }),
    })
    if (!res.ok) {
      alert(`Could not move prospect: ${(await res.json().catch(() => ({}))).error ?? res.statusText}`)
      setProspects(prev)
    }
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
        <DndContext sensors={sensors} onDragEnd={(e: DragEndEvent) => {
          const overCol = e.over?.id as ProspectPriority | undefined
          const id = e.active?.id as string | undefined
          if (!overCol || !id) return
          const p = prospects.find((x) => x.id === id)
          if (p && p.priority !== overCol) movePriority(id, overCol)
        }}>
          <p className="mb-2 text-xs text-zinc-500">Drag a prospect card to move them through the pipeline.</p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {columns.map((col) => (
              <DroppableColumn key={col.key} col={col} count={prospects.filter((p) => p.priority === col.key).length}>
                {prospects.filter((p) => p.priority === col.key).map((p) => (
                  <DraggableCard key={p.id} p={p} expanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />
                ))}
              </DroppableColumn>
            ))}
          </div>
        </DndContext>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <PositionPicker label="Futsal positions" options={FUTSAL_POSITIONS} value={form.futsal_positions} onChange={(v) => setForm({ ...form, futsal_positions: v })} />
                <PositionPicker label="Arena (MASL) positions" options={ARENA_POSITIONS} value={form.arena_positions} onChange={(v) => setForm({ ...form, arena_positions: v })} />
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

/* ── Drag-drop kanban primitives ── */
const COLS: { key: ProspectPriority; label: string }[] = [
  { key: "watch", label: "Watch" },
  { key: "target", label: "Target" },
  { key: "actively_recruiting", label: "Actively Recruiting" },
  { key: "signed", label: "Signed" },
  { key: "passed", label: "Passed" },
]

function DroppableColumn({
  col,
  count,
  children,
}: {
  col: { key: ProspectPriority; label: string; color: string }
  count: number
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key })
  return (
    <div ref={setNodeRef} className={`rounded-xl border ${col.color} ${isOver ? "bg-amber-500/10" : "bg-white/5"} p-3 transition-colors`}>
      <h3 className="mb-3 text-sm font-semibold text-white">
        {col.label} <span className="text-zinc-500">({count})</span>
      </h3>
      <div className="min-h-12 space-y-2">{children}</div>
    </div>
  )
}

function DraggableCard({ p, expanded, onToggle }: { p: Prospect; expanded: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: p.id })
  const positions = [...((p as { futsal_positions?: string[] }).futsal_positions ?? []), ...((p as { arena_positions?: string[] }).arena_positions ?? [])]
  return (
    <div
      ref={setNodeRef}
      style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-lg border border-white/10 bg-[#0f0f0f] p-3 transition-colors hover:border-white/20 active:cursor-grabbing"
    >
      <button type="button" onClick={onToggle} className="w-full text-left">
        <p className="text-sm font-medium text-white">{p.full_name}</p>
        <p className="text-xs text-zinc-500">{(positions.length ? positions.join(", ") : p.position) || "—"}{p.current_team ? ` · ${p.current_team}` : ""}</p>
        {p.event ? <p className="mt-1 text-[10px] text-zinc-600">Scouted: {p.event}</p> : null}
      </button>
      {expanded ? (
        <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
          {p.assessment ? <p className="text-xs text-zinc-400">{p.assessment}</p> : null}
          {p.contact ? <p className="text-xs text-zinc-500">Contact: {p.contact}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
