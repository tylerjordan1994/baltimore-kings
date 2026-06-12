import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { TacticsBoard } from "@/types/database"

// basePath handled by next.config.ts

export default async function AdminTacticsPage() {
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

  const { data: boards } = await supabase
    .from("tactics_boards")
    .select("*")
    .order("updated_at", { ascending: false })

  const allBoards = (boards as TacticsBoard[]) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Play Builder</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage tactics boards for your teams.
          </p>
        </div>
        <Link
          href={`/app/admin/tactics/new`}
          className="inline-flex h-8 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Board
        </Link>
      </div>

      {allBoards.length === 0 ? (
        <div className="rounded-xl border border-border bg-white shadow-sm p-8 text-center">
          <p className="text-muted-foreground">
            No tactics boards yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allBoards.map((board) => (
            <Link
              key={board.id}
              href={`/app/admin/tactics/${board.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition hover:border-zinc-300 hover:bg-paper"
            >
              <div className="aspect-video w-full overflow-hidden bg-paper">
                {board.preview_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={board.preview_image_url}
                    alt={board.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No preview
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 group-hover:bg-zinc-200">
                    {board.kind.replace("_", " ")}
                  </span>
                  {board.is_published ? (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700">
                      Published
                    </span>
                  ) : (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-700">
                      Draft
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-ink">
                  {board.name}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Updated{" "}
                  {new Date(board.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
