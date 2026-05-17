"use client"

import { useEffect } from "react"
import { useTacticsStore } from "@/lib/stores/tactics-store"
import { TacticsBoard as TacticsBoardComponent } from "@/components/tactics/tactics-board"
import type { TacticsBoard, TacticsBoardState, Team } from "@/types/database"
import { AddPlayerPanel, type RosterPlayer } from "./add-player-panel"

interface TacticsBoardEditorProps {
  board: TacticsBoard | null
  boardTeamIds: string[]
  teams: Pick<Team, "id" | "name">[]
  roster: RosterPlayer[]
}

export function TacticsBoardEditor({
  board,
  boardTeamIds,
  teams,
  roster,
}: TacticsBoardEditorProps) {
  const loadState = useTacticsStore((s) => s.loadState)
  const initNewBoard = useTacticsStore((s) => s.initNewBoard)

  useEffect(() => {
    if (board) {
      loadState({
        ...((board.state_json as TacticsBoardState | null) ?? {
          players: [],
          arrows: [],
          labels: [],
        }),
        id: board.id,
        name: board.name,
        kind: board.kind,
        field_type: board.field_type,
        team_ids: boardTeamIds,
        is_published: board.is_published,
        preview_image_url: board.preview_image_url,
      })
    } else {
      initNewBoard()
    }
  }, [board, boardTeamIds, loadState, initNewBoard])

  return (
    <div className="space-y-4">
      <TacticsBoardComponent editable={true} teams={teams} />
      <AddPlayerPanel roster={roster} />
    </div>
  )
}
