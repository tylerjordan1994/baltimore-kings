"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { useTacticsStore } from "@/lib/stores/tactics-store"
import { FieldSvg, svgPointFromEvent } from "./field-svg"
import { PlayerToken } from "./player-token"
import { ArrowLayer } from "./arrow-layer"
import { LabelLayer } from "./label-layer"
import { Toolbar } from "./toolbar"
import { createClient } from "@/lib/supabase/client"
import type { FieldType } from "@/types/database"

interface TacticsBoardProps {
  editable?: boolean
  teams?: { id: string; name: string }[]
}

export function TacticsBoard({ editable = false, teams = [] }: TacticsBoardProps) {
  const store = useTacticsStore()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  )

  // Auto-save debounce
  useEffect(() => {
    if (!editable || !store.isDirty || !store.boardId) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      handleSave()
    }, 1000)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isDirty, store.players, store.arrows, store.labels, store.name, store.kind, store.fieldType, store.teamId, store.isPublished, store.selectedPosition])

  const handleSave = useCallback(async () => {
    if (savingRef.current) return
    savingRef.current = true
    const supabase = createClient()
    const stateJson = store.getStateJson()

    const payload = {
      name: store.name,
      kind: store.kind,
      field_type: store.fieldType,
      team_id: store.teamId,
      is_published: store.isPublished,
      state_json: stateJson,
    }

    if (store.boardId) {
      await supabase
        .from("tactics_boards")
        .update(payload)
        .eq("id", store.boardId)
    } else {
      const { data } = await supabase
        .from("tactics_boards")
        .insert(payload)
        .select("id")
        .single()
      if (data) store.setBoardId(data.id)
    }

    store.markClean()
    savingRef.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.boardId, store.name, store.kind, store.fieldType, store.teamId, store.isPublished, store.players, store.arrows, store.labels])

  const handleDuplicate = useCallback(async () => {
    const supabase = createClient()
    const stateJson = store.getStateJson()
    const { data } = await supabase
      .from("tactics_boards")
      .insert({
        name: `${store.name} (copy)`,
        kind: store.kind,
        field_type: store.fieldType,
        team_id: store.teamId,
        is_published: false,
        state_json: stateJson,
      })
      .select("id")
      .single()
    if (data) {
      store.setBoardId(data.id)
      store.setName(`${store.name} (copy)`)
      store.setIsPublished(false)
      store.markClean()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.name, store.kind, store.fieldType, store.teamId])

  const handleDeleteBoard = useCallback(async () => {
    if (!store.boardId) return
    if (!confirm("Are you sure you want to delete this board?")) return
    const supabase = createClient()
    await supabase.from("tactics_boards").delete().eq("id", store.boardId)
    store.reset()
    window.history.back()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.boardId])

  const handleNew = useCallback(() => {
    store.reset()
  }, [store])

  // Handle field click for arrow/label/player/ball tools
  function handleFieldClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!editable) return
    const point = svgPointFromEvent(e, store.fieldType)

    if (store.tool === "arrow") {
      if (!store.arrowStart) {
        store.setArrowStart(point)
      } else {
        store.addArrow({
          id: crypto.randomUUID(),
          startX: store.arrowStart.x,
          startY: store.arrowStart.y,
          endX: point.x,
          endY: point.y,
          curved: store.curvedArrows,
          ...(store.curvedArrows
            ? {
                controlX: (store.arrowStart.x + point.x) / 2,
                controlY: (store.arrowStart.y + point.y) / 2 - 0.08,
              }
            : {}),
        })
        store.setArrowStart(null)
      }
    } else if (store.tool === "label") {
      const text = prompt("Enter label text:")
      if (text) {
        store.addLabel({
          id: crypto.randomUUID(),
          x: point.x,
          y: point.y,
          text,
        })
      }
    } else if (store.tool === "ball") {
      store.addPlayer({
        id: crypto.randomUUID(),
        x: point.x,
        y: point.y,
        jerseyNumber: 0,
        name: "Ball",
        team: "home",
        tokenType: "ball",
      })
    } else if (store.tool === "player_home" || store.tool === "player_away") {
      const team = store.tool === "player_home" ? "home" : "away"
      const teamPlayers = store.players.filter(
        (p) => p.team === team && p.tokenType !== "ball"
      )
      const nextNumber = teamPlayers.length + 1
      store.addPlayer({
        id: crypto.randomUUID(),
        x: point.x,
        y: point.y,
        jerseyNumber: nextNumber,
        name: store.selectedPosition,
        team,
        tokenType: "player",
        position: store.selectedPosition,
      })
    } else if (store.tool === "select") {
      store.setSelectedId(null)
    }
  }

  // Handle drag end for player tokens
  function handleDragEnd(event: DragEndEvent) {
    if (!editable) return
    const { active, delta } = event
    const playerId = active.id as string
    const player = store.players.find((p) => p.id === playerId)
    if (!player) return

    const svgEl = document.querySelector("[data-tactics-svg]") as SVGSVGElement | null
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    const vbWidth = 1000
    const vbHeight = store.fieldType === "futsal_rounded" ? 500 : 425

    const dx = delta.x / rect.width
    const dy = delta.y / rect.height

    const newX = Math.max(0, Math.min(1, player.x + dx))
    const newY = Math.max(0, Math.min(1, player.y + dy))
    store.movePlayer(playerId, newX, newY)
  }

  // Keyboard navigation for selected token
  useEffect(() => {
    if (!editable) return
    function handleKeyDown(e: KeyboardEvent) {
      const { selectedId, players, movePlayer, removePlayer, removeArrow, removeLabel, arrows, labels } = useTacticsStore.getState()
      if (!selectedId) return

      const step = 0.01 // ~10px in 1000-unit viewport
      const player = players.find((p) => p.id === selectedId)

      if (e.key === "Delete" || e.key === "Backspace") {
        if (player) removePlayer(selectedId)
        else if (arrows.find((a) => a.id === selectedId)) removeArrow(selectedId)
        else if (labels.find((l) => l.id === selectedId)) removeLabel(selectedId)
        return
      }

      if (!player) return
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          movePlayer(selectedId, player.x, Math.max(0, player.y - step))
          break
        case "ArrowDown":
          e.preventDefault()
          movePlayer(selectedId, player.x, Math.min(1, player.y + step))
          break
        case "ArrowLeft":
          e.preventDefault()
          movePlayer(selectedId, Math.max(0, player.x - step), player.y)
          break
        case "ArrowRight":
          e.preventDefault()
          movePlayer(selectedId, Math.min(1, player.x + step), player.y)
          break
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [editable])

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile warning */}
      {editable && (
        <div className="block rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center text-sm text-amber-300 md:hidden">
          View only on mobile. Rotate to landscape or use a larger screen for
          editing.
        </div>
      )}

      {/* Toolbar (editor only, hidden on mobile) */}
      {editable && (
        <div className="hidden md:block">
          <Toolbar
            teams={teams}
            onSave={handleSave}
            onDuplicate={handleDuplicate}
            onDelete={handleDeleteBoard}
            onNew={handleNew}
            saving={savingRef.current}
          />
        </div>
      )}

      {/* Arrow start indicator */}
      {editable && store.arrowStart && (
        <div className="text-center text-xs text-zinc-400">
          Click on the field to set the arrow endpoint
        </div>
      )}

      {/* Board */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative">
          <FieldSvg
            fieldType={store.fieldType}
            onClick={handleFieldClick}
          >
            {/* field SVG now has data-tactics-svg attribute directly */}

            {/* Arrows */}
            <ArrowLayer
              arrows={store.arrows}
              fieldType={store.fieldType}
              interactive={editable}
            />

            {/* Labels */}
            <LabelLayer
              labels={store.labels}
              fieldType={store.fieldType}
              interactive={editable}
            />

            {/* Players */}
            {store.players.map((player) => (
              <PlayerToken
                key={player.id}
                player={player}
                fieldType={store.fieldType}
                isSelected={store.selectedId === player.id}
                onSelect={(id) => store.setSelectedId(id)}
                disabled={!editable}
              />
            ))}

            {/* Arrow start preview dot */}
            {store.arrowStart && (
              <circle
                cx={store.arrowStart.x * 1000}
                cy={
                  store.arrowStart.y *
                  (store.fieldType === "futsal_rounded" ? 500 : 425)
                }
                r="5"
                fill="#fbbf24"
                opacity="0.8"
              />
            )}
          </FieldSvg>
        </div>
      </DndContext>
    </div>
  )
}
