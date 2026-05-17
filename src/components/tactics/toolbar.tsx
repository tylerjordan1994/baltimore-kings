"use client"

import { useTacticsStore } from "@/lib/stores/tactics-store"
import { Button } from "@/components/ui/button"
import type { TacticsKind, FieldType } from "@/types/database"

interface ToolbarProps {
  teams: { id: string; name: string }[]
  onSave: () => void
  onDuplicate: () => void
  onDelete: () => void
  onNew: () => void
  onAddLabel: () => void
  onExport: () => void
  saving?: boolean
}

export function Toolbar({
  teams,
  onSave,
  onDuplicate,
  onDelete,
  onNew,
  onAddLabel,
  onExport,
  saving,
}: ToolbarProps) {
  const name = useTacticsStore((s) => s.name)
  const setName = useTacticsStore((s) => s.setName)
  const kind = useTacticsStore((s) => s.kind)
  const setKind = useTacticsStore((s) => s.setKind)
  const fieldType = useTacticsStore((s) => s.fieldType)
  const setFieldType = useTacticsStore((s) => s.setFieldType)
  const teamIds = useTacticsStore((s) => s.teamIds)
  const toggleTeamId = useTacticsStore((s) => s.toggleTeamId)
  const isPublished = useTacticsStore((s) => s.isPublished)
  const setIsPublished = useTacticsStore((s) => s.setIsPublished)
  const isDirty = useTacticsStore((s) => s.isDirty)
  const selectedId = useTacticsStore((s) => s.selectedId)
  const arrows = useTacticsStore((s) => s.arrows)
  const players = useTacticsStore((s) => s.players)
  const addPlayer = useTacticsStore((s) => s.addPlayer)
  const addArrow = useTacticsStore((s) => s.addArrow)
  const updateArrow = useTacticsStore((s) => s.updateArrow)
  const deleteSelected = useTacticsStore((s) => s.deleteSelected)
  const setSelectedId = useTacticsStore((s) => s.setSelectedId)
  const undo = useTacticsStore((s) => s.undo)
  const history = useTacticsStore((s) => s.history)

  const selectedArrow = arrows.find((a) => a.id === selectedId)
  const hasBall = players.some((p) => p.tokenType === "ball")

  function addBall() {
    if (hasBall) {
      setSelectedId(players.find((p) => p.tokenType === "ball")!.id)
      return
    }
    addPlayer({
      id: crypto.randomUUID(),
      x: 0.5,
      y: 0.5,
      name: "Ball",
      team: "home",
      tokenType: "ball",
    })
  }

  function addNewArrow() {
    const id = crypto.randomUUID()
    addArrow({
      id,
      startX: 0.4,
      startY: 0.5,
      endX: 0.6,
      endY: 0.5,
      style: "solid",
      curved: false,
    })
    setSelectedId(id)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-7 w-44 rounded border border-zinc-700 bg-zinc-800 px-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
        placeholder="Board name..."
      />

      <div className="h-5 w-px bg-zinc-700" />

      {/* Add elements */}
      <Button variant="outline" size="sm" onClick={addBall}>
        + Ball
      </Button>
      <Button variant="outline" size="sm" onClick={addNewArrow}>
        + Arrow
      </Button>
      <Button variant="outline" size="sm" onClick={onAddLabel}>
        + Label
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={undo}
        disabled={history.length === 0}
      >
        Undo
      </Button>

      {/* Selected arrow controls */}
      {selectedArrow && (
        <>
          <div className="h-5 w-px bg-zinc-700" />
          <Button
            variant={selectedArrow.style === "dashed" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              updateArrow(selectedArrow.id, {
                style: selectedArrow.style === "dashed" ? "solid" : "dashed",
              })
            }
          >
            {selectedArrow.style === "dashed" ? "Dashed" : "Solid"}
          </Button>
          <Button
            variant={selectedArrow.curved ? "default" : "outline"}
            size="sm"
            onClick={() =>
              updateArrow(selectedArrow.id, { curved: !selectedArrow.curved })
            }
          >
            {selectedArrow.curved ? "Curved" : "Straight"}
          </Button>
        </>
      )}

      {selectedId && (
        <Button variant="destructive" size="sm" onClick={deleteSelected}>
          Delete selected
        </Button>
      )}

      <div className="h-5 w-px bg-zinc-700" />

      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as TacticsKind)}
        className="h-7 rounded border border-zinc-700 bg-zinc-800 px-2 text-xs text-white"
      >
        <option value="formation">Formation</option>
        <option value="set_piece">Set Piece</option>
        <option value="play">Play</option>
      </select>

      <select
        value={fieldType}
        onChange={(e) => setFieldType(e.target.value as FieldType)}
        className="h-7 rounded border border-zinc-700 bg-zinc-800 px-2 text-xs text-white"
      >
        <option value="futsal_rounded">Futsal Court</option>
        <option value="masl_rounded_extra_player">MASL Arena</option>
      </select>

      {/* Multi-team assignment */}
      {teams.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1">
          <span className="text-xs text-zinc-500">Teams:</span>
          {teams.map((t) => (
            <label
              key={t.id}
              className="flex items-center gap-1 text-xs text-zinc-300"
            >
              <input
                type="checkbox"
                checked={teamIds.includes(t.id)}
                onChange={() => toggleTeamId(t.id)}
                className="rounded"
              />
              {t.name}
            </label>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="ml-auto flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onNew}>
          New
        </Button>
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          Export PNG
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPublished(!isPublished)}
        >
          {isPublished ? "Published" : "Draft"}
        </Button>
        <Button variant="default" size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : isDirty ? "Save *" : "Save"}
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete Board
        </Button>
      </div>
    </div>
  )
}
