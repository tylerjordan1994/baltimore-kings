import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { TacticsBoard } from "@/types/database"
import { NewPlayButton, ShareButton } from "./tactics-actions"

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

  // My own plays
  const { data: myData } = await supabase.from("tactics_boards").select("*").eq("created_by", user.id).order("updated_at", { ascending: false })
  const myBoards = (myData as TacticsBoard[]) ?? []

  // Shared with me
  const { data: shareRows } = await supabase.from("tactics_board_shares").select("board_id").eq("shared_with", user.id)
  const sharedIds = (shareRows ?? []).map((r) => r.board_id as string)
  let sharedBoards: TacticsBoard[] = []
  if (sharedIds.length) {
    const { data } = await supabase.from("tactics_boards").select("*").in("id", sharedIds).order("updated_at", { ascending: false })
    sharedBoards = ((data as TacticsBoard[]) ?? []).filter((b) => b.created_by !== user.id)
  }

  // Team published plays
  let boards: TacticsBoard[] = []
  if (teamIds.length > 0) {
    const { data: joinRows } = await supabase.from("tactics_board_teams").select("board_id").in("team_id", teamIds)
    const joinBoardIds = new Set(joinRows?.map((r) => r.board_id) ?? [])
    const { data } = await supabase.from("tactics_boards").select("*").eq("is_published", true).order("updated_at", { ascending: false })
    boards = ((data as TacticsBoard[]) ?? []).filter(
      (b) => (joinBoardIds.has(b.id) || (b.team_id !== null && teamIds.includes(b.team_id))) && b.created_by !== user.id,
    )
  }

  // Members to share with
  const { data: memberData } = await supabase.from("profiles").select("id, full_name").in("role", ["player", "coach", "superadmin"]).order("full_name")
  const members = (memberData ?? []) as { id: string; full_name: string }[]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Play Builder</h1>
          <p className="mt-1 text-muted-foreground">Make your own plays and share them, plus plays from your coaches.</p>
        </div>
        <NewPlayButton />
      </div>

      <Section title="My plays" empty="You haven't made any plays yet. Hit “New play” to start.">
        {myBoards.map((b) => <BoardCard key={b.id} board={b} teams={teams} share={<ShareButton boardId={b.id} members={members.filter((m) => m.id !== user.id)} />} />)}
      </Section>

      {sharedBoards.length > 0 && (
        <Section title="Shared with me" empty="">
          {sharedBoards.map((b) => <BoardCard key={b.id} board={b} teams={teams} />)}
        </Section>
      )}

      <Section title="From your coaches" empty="No published plays from your coaches yet.">
        {boards.map((b) => <BoardCard key={b.id} board={b} teams={teams} />)}
      </Section>
    </div>
  )
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children]
  const hasItems = items.some(Boolean)
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {hasItems ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      ) : empty ? (
        <div className="rounded-xl border border-border bg-white shadow-sm p-6 text-center text-sm text-muted-foreground">{empty}</div>
      ) : null}
    </div>
  )
}

function BoardCard({ board, teams, share }: { board: TacticsBoard; teams: { id: string; name: string }[]; share?: React.ReactNode }) {
  const team = teams?.find((t) => t.id === board.team_id)
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition hover:border-zinc-300">
      <Link href={`/app/tactics/${board.id}`}>
        <div className="aspect-video w-full overflow-hidden bg-paper">
          {board.preview_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={board.preview_image_url} alt={board.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No preview</div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">{board.kind.replace("_", " ")}</span>
          <span className="text-xs text-muted-foreground">{board.field_type === "futsal_rounded" ? "Futsal" : "MASL"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Link href={`/app/tactics/${board.id}`} className="text-lg font-semibold text-ink hover:underline">{board.name}</Link>
          {share}
        </div>
        {team && <p className="mt-1 text-sm text-muted-foreground">{team.name}</p>}
      </div>
    </div>
  )
}
