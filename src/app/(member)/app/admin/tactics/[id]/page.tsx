import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import type { TacticsBoard, Team } from "@/types/database"
import { TacticsBoardEditor } from "./editor"

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

  // "new" means create a fresh board
  if (id === "new") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">New Tactics Board</h1>
        <TacticsBoardEditor
          board={null}
          teams={(teams as Pick<Team, "id" | "name">[]) ?? []}
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Edit: {board.name}</h1>
      <TacticsBoardEditor
        board={board as TacticsBoard}
        teams={(teams as Pick<Team, "id" | "name">[]) ?? []}
      />
    </div>
  )
}
