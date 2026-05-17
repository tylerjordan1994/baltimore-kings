import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { TacticsBoard } from "@/types/database"

// basePath handled by next.config.ts

export default async function TacticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login`)

  // Teams the player belongs to
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("team_id, teams(id, name)")
    .eq("profile_id", user.id)

  const teamIds = teamMembers?.map((tm) => tm.team_id) ?? []
  const teams = (teamMembers
    ?.map((tm) => tm.teams)
    .flat()
    .filter(Boolean) ?? []) as unknown as { id: string; name: string }[]

  let boards: TacticsBoard[] = []
  if (teamIds.length > 0) {
    // Board ids assigned via the multi-team join table
    const { data: joinRows } = await supabase
      .from("tactics_board_teams")
      .select("board_id")
      .in("team_id", teamIds)
    const joinBoardIds = new Set(joinRows?.map((r) => r.board_id) ?? [])

    const { data } = await supabase
      .from("tactics_boards")
      .select("*")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })

    boards = ((data as TacticsBoard[]) ?? []).filter(
      (b) =>
        joinBoardIds.has(b.id) ||
        (b.team_id !== null && teamIds.includes(b.team_id))
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Tactics</h1>
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
                href={`/app/tactics/${board.id}`}
                className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700 hover:bg-zinc-800/50"
              >
                <div className="aspect-video w-full overflow-hidden bg-zinc-950">
                  {board.preview_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={board.preview_image_url}
                      alt={board.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                      No preview
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 group-hover:bg-zinc-700">
                      {board.kind.replace("_", " ")}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {board.field_type === "futsal_rounded"
                        ? "Futsal"
                        : "MASL"}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {board.name}
                  </h3>
                  {team && (
                    <p className="mt-1 text-sm text-zinc-500">{team.name}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
