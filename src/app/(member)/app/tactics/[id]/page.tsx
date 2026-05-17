import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import type { TacticsBoard } from "@/types/database"
import { TacticsBoardViewer } from "./viewer"

const basePath = "/project/football-team"

export default async function ViewTacticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`${basePath}/login`)

  const { data: board } = await supabase
    .from("tactics_boards")
    .select("*")
    .eq("id", id)
    .single()

  if (!board) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{board.name}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {board.kind.replace("_", " ")} &middot;{" "}
          {board.field_type === "futsal_rounded" ? "Futsal" : "MASL Arena"}
        </p>
      </div>
      <TacticsBoardViewer board={board as TacticsBoard} />
    </div>
  )
}
