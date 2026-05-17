"use client"

import { useEffect } from "react"
import { useTacticsStore } from "@/lib/stores/tactics-store"
import { TacticsBoard as TacticsBoardComponent } from "@/components/tactics/tactics-board"
import type { TacticsBoard } from "@/types/database"

interface TacticsBoardViewerProps {
  board: TacticsBoard
}

export function TacticsBoardViewer({ board }: TacticsBoardViewerProps) {
  const loadState = useTacticsStore((s) => s.loadState)

  useEffect(() => {
    loadState({
      ...board.state_json,
      id: board.id,
      name: board.name,
      kind: board.kind,
      field_type: board.field_type,
      team_id: board.team_id,
      is_published: board.is_published,
    })
  }, [board, loadState])

  return <TacticsBoardComponent editable={false} />
}
