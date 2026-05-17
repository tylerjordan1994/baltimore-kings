"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { toPng } from "html-to-image"
import { useTacticsStore } from "@/lib/stores/tactics-store"
import { FieldSvg } from "./field-svg"
import { PlayerToken } from "./player-token"
import { ArrowLayer } from "./arrow-layer"
import { LabelLayer } from "./label-layer"
import { Toolbar } from "./toolbar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface TacticsBoardProps {
  editable?: boolean
  teams?: { id: string; name: string }[]
}

type LabelModal = { mode: "new" } | { mode: "edit"; id: string } | null

export function TacticsBoard({ editable = false, teams = [] }: TacticsBoardProps) {
  const store = useTacticsStore()
  const captureRef = useRef<HTMLDivElement | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)
  const [saving, setSaving] = useState(false)
  const [labelModal, setLabelModal] = useState<LabelModal>(null)
  const [labelText, setLabelText] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  )

  /** Render the board to a PNG data URL. Returns null on failure. */
  const exportPng = useCallback(async (): Promise<string | null> => {
    if (!captureRef.current) return null
    try {
      return await toPng(captureRef.current, {
        backgroundColor: "#18181b",
        pixelRatio: 2,
        cacheBust: true,
      })
    } catch {
      return null
    }
  }, [])

  const persist = useCallback(
    async (withSnapshot: boolean) => {
      if (savingRef.current) return
      savingRef.current = true
      setSaving(true)
      try {
        const supabase = createClient()
        const s = useTacticsStore.getState()

        // Mint the board id up front so the preview file path is known even
        // on the very first save. The same id is used for the DB insert.
        const isFirstSave = !s.boardId
        const boardId = s.boardId ?? crypto.randomUUID()

        // Generate the preview BEFORE writing rows so the very first save can
        // persist preview_image_url immediately. Autosave also refreshes the
        // preview so a snapshot always exists after any save.
        let previewUrl = s.previewImageUrl
        const dataUrl = await exportPng()
        if (dataUrl) {
          const blob = await (await fetch(dataUrl)).blob()
          const path = `tactics/${boardId}.png`
          const { error: upErr } = await supabase.storage
            .from("media")
            .upload(path, blob, {
              upsert: true,
              contentType: "image/png",
            })
          if (!upErr) {
            const { data: pub } = supabase.storage
              .from("media")
              .getPublicUrl(path)
            previewUrl = `${pub.publicUrl}?v=${Date.now()}`
            store.setPreviewImageUrl(previewUrl)
          }
        }

        const latest = useTacticsStore.getState()
        const payload = {
          name: latest.name,
          kind: latest.kind,
          field_type: latest.fieldType,
          team_id: latest.teamIds[0] ?? null,
          is_published: latest.isPublished,
          state_json: latest.getStateJson(),
          preview_image_url: previewUrl,
        }

        if (isFirstSave) {
          const { error } = await supabase
            .from("tactics_boards")
            .insert({ id: boardId, ...payload })
          if (error) throw error
          store.setBoardId(boardId)
        } else {
          await supabase
            .from("tactics_boards")
            .update(payload)
            .eq("id", boardId)
        }

        // Sync the multi-team join table
        await supabase
          .from("tactics_board_teams")
          .delete()
          .eq("board_id", boardId)
        if (latest.teamIds.length > 0) {
          await supabase.from("tactics_board_teams").insert(
            latest.teamIds.map((team_id) => ({ board_id: boardId, team_id }))
          )
        }

        store.markClean()
        if (withSnapshot) toast.success("Board saved")
      } catch {
        toast.error("Failed to save board")
      } finally {
        savingRef.current = false
        setSaving(false)
      }
    },
    [store, exportPng]
  )

  // Debounced autosave (state only, no snapshot)
  useEffect(() => {
    if (!editable || !store.isDirty || !store.boardId) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => persist(false), 1500)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.isDirty,
    store.players,
    store.arrows,
    store.labels,
    store.name,
    store.kind,
    store.fieldType,
    store.teamIds,
    store.isPublished,
  ])

  const handleSave = useCallback(() => persist(true), [persist])

  const handleExport = useCallback(async () => {
    const dataUrl = await exportPng()
    if (!dataUrl) {
      toast.error("Could not export image")
      return
    }
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `${store.name || "tactics-board"}.png`
    a.click()
  }, [exportPng, store.name])

  const handleDuplicate = useCallback(async () => {
    const supabase = createClient()
    const s = useTacticsStore.getState()
    const { data, error } = await supabase
      .from("tactics_boards")
      .insert({
        name: `${s.name} (copy)`,
        kind: s.kind,
        field_type: s.fieldType,
        team_id: s.teamIds[0] ?? null,
        is_published: false,
        state_json: s.getStateJson(),
      })
      .select("id")
      .single()
    if (error || !data) {
      toast.error("Failed to duplicate")
      return
    }
    if (s.teamIds.length > 0) {
      await supabase.from("tactics_board_teams").insert(
        s.teamIds.map((team_id) => ({ board_id: data.id, team_id }))
      )
    }
    toast.success("Board duplicated")
    window.location.href = `/app/admin/tactics/${data.id}`
  }, [])

  const handleDeleteBoard = useCallback(async () => {
    const s = useTacticsStore.getState()
    if (!s.boardId) return
    if (!confirm("Delete this board? This cannot be undone.")) return
    const supabase = createClient()
    await supabase.from("tactics_boards").delete().eq("id", s.boardId)
    window.location.href = `/app/admin/tactics`
  }, [])

  const handleNew = useCallback(() => {
    store.initNewBoard(store.fieldType, store.kind)
  }, [store])

  function handleFieldClick() {
    if (!editable) return
    store.setSelectedId(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!editable) return
    const { active, delta } = event
    const playerId = active.id as string
    const player = store.players.find((p) => p.id === playerId)
    if (!player) return
    const svgEl = document.querySelector(
      "[data-tactics-svg]"
    ) as SVGSVGElement | null
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    const newX = Math.max(0, Math.min(1, player.x + delta.x / rect.width))
    const newY = Math.max(0, Math.min(1, player.y + delta.y / rect.height))
    store.movePlayer(playerId, newX, newY)
  }

  // Keyboard: arrows nudge, Delete removes selected
  useEffect(() => {
    if (!editable) return
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
      const s = useTacticsStore.getState()
      if (!s.selectedId) return
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        s.deleteSelected()
        return
      }
      const player = s.players.find((p) => p.id === s.selectedId)
      if (!player) return
      const step = 0.01
      if (e.key === "ArrowUp") {
        e.preventDefault()
        s.movePlayer(player.id, player.x, Math.max(0, player.y - step))
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        s.movePlayer(player.id, player.x, Math.min(1, player.y + step))
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        s.movePlayer(player.id, Math.max(0, player.x - step), player.y)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        s.movePlayer(player.id, Math.min(1, player.x + step), player.y)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [editable])

  function openNewLabel() {
    setLabelText("")
    setLabelModal({ mode: "new" })
  }

  function openEditLabel(id: string) {
    const label = store.labels.find((l) => l.id === id)
    setLabelText(label?.text ?? "")
    setLabelModal({ mode: "edit", id })
  }

  function confirmLabel() {
    const text = labelText.trim()
    if (!text || !labelModal) {
      setLabelModal(null)
      return
    }
    if (labelModal.mode === "new") {
      store.addLabel({ id: crypto.randomUUID(), x: 0.5, y: 0.5, text })
    } else {
      store.updateLabel(labelModal.id, { text })
    }
    setLabelModal(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {editable && (
        <div className="block rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center text-sm text-amber-300 md:hidden">
          View only on mobile. Use a larger screen to edit.
        </div>
      )}

      {editable && (
        <div className="hidden md:block">
          <Toolbar
            teams={teams}
            onSave={handleSave}
            onDuplicate={handleDuplicate}
            onDelete={handleDeleteBoard}
            onNew={handleNew}
            onAddLabel={openNewLabel}
            onExport={handleExport}
            saving={saving}
          />
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div ref={captureRef} className="relative">
          <FieldSvg fieldType={store.fieldType} onClick={handleFieldClick}>
            <ArrowLayer
              arrows={store.arrows}
              fieldType={store.fieldType}
              interactive={editable}
            />
            <LabelLayer
              labels={store.labels}
              fieldType={store.fieldType}
              interactive={editable}
              onEditLabel={openEditLabel}
            />
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
          </FieldSvg>
        </div>
      </DndContext>

      {/* Label text modal */}
      {labelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setLabelModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-sm font-semibold text-white">
              {labelModal.mode === "new" ? "Add label" : "Edit label"}
            </h3>
            <input
              autoFocus
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmLabel()
                if (e.key === "Escape") setLabelModal(null)
              }}
              placeholder="Label text..."
              className="h-9 w-full rounded border border-zinc-700 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLabelModal(null)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={confirmLabel}>
                {labelModal.mode === "new" ? "Add" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
