import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { TacticsBoard } from "@/types/database"

const basePath = "/project/football-team"

export default async function TacticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`${basePath}/login`)

  // Get user's teams
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("team_id, teams(id, name)")
    .eq("profile_id", user.id)

  const teamIds = teamMembers?.map((tm) => tm.team_id) ?? []

  // Get published tactics boards for user's teams
  let boards: TacticsBoard[] = []
  if (teamIds.length > 0) {
    const { data } = await supabase
      .from("tactics_boards")
      .select("*")
      .eq("is_published", true)
      .in("team_id", teamIds)
      .order("updated_at", { ascending: false })
    boards = (data as TacticsBoard[]) ?? []
  }

  const teams = (teamMembers
    ?.map((tm) => tm.teams)
    .flat()
    .filter(Boolean) ?? []) as unknown as { id: string; name: string }[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tactics</h1>
        <p className="mt-1 text-zinc-400">
          View formations, set pieces, and plays from your coaches.
        </p>
      </div>

      {boards.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-400">
            No published tactics boards yet. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const team = teams?.find((t) => t.id === board.team_id)
            return (
              <Link
                key={board.id}
                href={`${basePath}/app/tactics/${board.id}`}
                className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 hover:bg-zinc-800/50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 group-hover:bg-zinc-700">
                    {board.kind.replace("_", " ")}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {board.field_type === "futsal_rounded" ? "Futsal" : "MASL"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {board.name}
                </h3>
                {team && (
                  <p className="mt-1 text-sm text-zinc-500">{team.name}</p>
                )}
                <p className="mt-2 text-xs text-zinc-600">
                  Updated{" "}
                  {new Date(board.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
