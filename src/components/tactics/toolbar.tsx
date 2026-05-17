"use client"

import { useTacticsStore, type TacticsTool, FUTSAL_POSITIONS, MASL_POSITIONS } from "@/lib/stores/tactics-store"
import { Button } from "@/components/ui/button"
import type { TacticsKind, FieldType, TacticsPosition } from "@/types/database"

interface ToolbarProps {
  teams: { id: string; name: string }[]
  onSave: () => void
  onDuplicate: () => void
  onDelete: () => void
  onNew: () => void
  saving?: boolean
}

export function Toolbar({
  teams,
  onSave,
  onDuplicate,
  onDelete,
  onNew,
  saving,
}: ToolbarProps) {
  const tool = useTacticsStore((s) => s.tool)
  const setTool = useTacticsStore((s) => s.setTool)
  const curvedArrows = useTacticsStore((s) => s.curvedArrows)
  const setCurvedArrows = useTacticsStore((s) => s.setCurvedArrows)
  const name = useTacticsStore((s) => s.name)
  const setName = useTacticsStore((s) => s.setName)
  const kind = useTacticsStore((s) => s.kind)
  const setKind = useTacticsStore((s) => s.setKind)
  const fieldType = useTacticsStore((s) => s.fieldType)
  const setFieldType = useTacticsStore((s) => s.setFieldType)
  const teamId = useTacticsStore((s) => s.teamId)
  const setTeamId = useTacticsStore((s) => s.setTeamId)
  const isPublished = useTacticsStore((s) => s.isPublished)
  const setIsPublished = useTacticsStore((s) => s.setIsPublished)
  const selectedId = useTacticsStore((s) => s.selectedId)
  const removePlayer = useTacticsStore((s) => s.removePlayer)
  const removeArrow = useTacticsStore((s) => s.removeArrow)
  const removeLabel = useTacticsStore((s) => s.removeLabel)
  const players = useTacticsStore((s) => s.players)
  const arrows = useTacticsStore((s) => s.arrows)
  const labels = useTacticsStore((s) => s.labels)
  const isDirty = useTacticsStore((s) => s.isDirty)
  const selectedPosition = useTacticsStore((s) => s.selectedPosition)
  const setSelectedPosition = useTacticsStore((s) => s.setSelectedPosition)

  const isFutsal = fieldType === "futsal_rounded"
  const positions = isFutsal ? FUTSAL_POSITIONS : MASL_POSITIONS

  function handleDeleteSelected() {
    if (!selectedId) return
    if (players.find((p) => p.id === selectedId)) removePlayer(selectedId)
    else if (arrows.find((a) => a.id === selectedId)) removeArrow(selectedId)
    else if (labels.find((l) => l.id === selectedId)) removeLabel(selectedId)
  }

  const toolBtn = (t: TacticsTool, label: string) => (
    <Button
      variant={tool === t ? "default" : "outline"}
      size="sm"
      onClick={() => setTool(t)}
    >
      {label}
    </Button>
  )

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      {/* Board name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-7 w-48 rounded border border-zinc-700 bg-zinc-800 px-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
        placeholder="Board name..."
      />

      <div className="h-5 w-px bg-zinc-700" />

      {/* Tools */}
      <div className="flex gap-1">
        {toolBtn("select", "Select")}
        {toolBtn("player_home", "Home")}
        {toolBtn("player_away", "Away")}
        {toolBtn("ball", "Ball")}
        {toolBtn("arrow", "Arrow")}
        {toolBtn("label", "Label")}
      </div>

      {/* Position selector for player tools */}
      {(tool === "player_home" || tool === "player_away") && (
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value as TacticsPosition)}
          className="h-7 rounded border border-zinc-700 bg-zinc-800 px-2 text-xs text-white"
        >
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      )}

      {/* Arrow curve toggle */}
      {tool === "arrow" && (
        <label className="flex items-center gap-1.5 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={curvedArrows}
            onChange={(e) => setCurvedArrows(e.target.checked)}
            className="rounded"
          />
          Curved
        </label>
      )}

      <div className="h-5 w-px bg-zinc-700" />

      {/* Kind selector */}
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as TacticsKind)}
        className="h-7 rounded border border-zinc-700 bg-zinc-800 px-2 text-xs text-white"
      >
        <option value="formation">Formation</option>
        <option value="set_piece">Set Piece</option>
        <option value="play">Play</option>
      </select>

      {/* Field type */}
      <select
        value={fieldType}
        onChange={(e) => setFieldType(e.target.value as FieldType)}
        className="h-7 rounded border border-zinc-700 bg-zinc-800 px-2 text-xs text-white"
      >
        <option value="futsal_rounded">Futsal Court</option>
        <option value="masl_rounded_extra_player">MASL Arena</option>
      </select>

      {/* Team selector */}
      <select
        value={teamId ?? ""}
        onChange={(e) => setTeamId(e.target.value || null)}
        className="h-7 rounded border border-zinc-700 bg-zinc-800 px-2 text-xs text-white"
      >
        <option value="">No team</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div className="h-5 w-px bg-zinc-700" />

      {/* Delete selected */}
      {selectedId && (
        <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
          Delete
        </Button>
      )}

      {/* Actions */}
      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm" onClick={onNew}>
          New
        </Button>
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          Duplicate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPublished(!isPublished)}
        >
          {isPublished ? "Unpublish" : "Publish"}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : isDirty ? "Save *" : "Save"}
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete Board
        </Button>
      </div>
    </div>
  )
}
