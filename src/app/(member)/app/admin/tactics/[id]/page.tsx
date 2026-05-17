import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import type { TacticsBoard, Team } from "@/types/database"
import { TacticsBoardEditor } from "./editor"
import type { RosterPlayer } from "./add-player-panel"

// basePath handled by next.config.ts

export default async function EditTacticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login`)

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "coach" && profile.role !== "superadmin")) {
    redirect(`/app`)
  }

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .eq("is_active", true)
    .order("name")

  const { data: rosterRows } = await supabase
    .from("profiles")
    .select("id, full_name, photo_url")
    .in("role", ["player", "coach"])
    .order("full_name")

  const roster = (rosterRows as RosterPlayer[]) ?? []
  const allTeams = (teams as Pick<Team, "id" | "name">[]) ?? []

  if (id === "new") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">New Team Tactics Board</h1>
        <TacticsBoardEditor
          board={null}
          boardTeamIds={[]}
          teams={allTeams}
          roster={roster}
        />
      </div>
    )
  }

  const { data: board } = await supabase
    .from("tactics_boards")
    .select("*")
    .eq("id", id)
    .single()

  if (!board) notFound()

  const { data: boardTeams } = await supabase
    .from("tactics_board_teams")
    .select("team_id")
    .eq("board_id", id)

  const boardTeamIds =
    boardTeams?.map((row) => row.team_id) ??
    (board.team_id ? [board.team_id] : [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Edit: {board.name}</h1>
      <TacticsBoardEditor
        board={board as TacticsBoard}
        boardTeamIds={boardTeamIds}
        teams={allTeams}
        roster={roster}
      />
    </div>
  )
}
