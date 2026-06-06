import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/** Share a play with specific members (players/coaches). Owner or coach only (RLS-enforced). */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { board_id, profile_ids } = await request.json()
  if (!board_id || !Array.isArray(profile_ids)) {
    return NextResponse.json({ error: "board_id and profile_ids required" }, { status: 400 })
  }
  const rows = (profile_ids as string[]).map((pid) => ({ board_id, shared_with: pid, shared_by: user.id }))
  if (rows.length === 0) return NextResponse.json({ ok: true })

  // upsert so re-sharing is idempotent; RLS limits this to boards the user owns.
  const { error } = await supabase.from("tactics_board_shares").upsert(rows, { onConflict: "board_id,shared_with" })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, shared: rows.length })
}

/** Remove a share. */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const boardId = request.nextUrl.searchParams.get("board_id")
  const profileId = request.nextUrl.searchParams.get("profile_id")
  if (!boardId || !profileId) return NextResponse.json({ error: "board_id and profile_id required" }, { status: 400 })

  const { error } = await supabase.from("tactics_board_shares").delete().eq("board_id", boardId).eq("shared_with", profileId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
