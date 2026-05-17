"use client"

import { useEffect } from "react"
import { useTacticsStore } from "@/lib/stores/tactics-store"
import { TacticsBoard as TacticsBoardComponent } from "@/components/tactics/tactics-board"
import type { TacticsBoard, Team } from "@/types/database"
import { AddPlayerPanel } from "./add-player-panel"

interface TacticsBoardEditorProps {
  board: TacticsBoard | null
  teams: Pick<Team, "id" | "name">[]
}

export function TacticsBoardEditor({ board, teams }: TacticsBoardEditorProps) {
  const loadState = useTacticsStore((s) => s.loadState)
  const reset = useTacticsStore((s) => s.reset)

  useEffect(() => {
    if (board) {
      loadState({
        ...board.state_json,
        id: board.id,
        name: board.name,
        kind: board.kind,
        field_type: board.field_type,
        team_id: board.team_id,
        is_published: board.is_published,
      })
    } else {
      reset()
    }
  }, [board, loadState, reset])

  return (
    <div className="space-y-4">
      <TacticsBoardComponent editable={true} teams={teams} />
      <AddPlayerPanel />
    </div>
  )
}
