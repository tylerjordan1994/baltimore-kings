import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  const teamId = request.nextUrl.searchParams.get("team_id")
  const isCoach = profile.role === "coach" || profile.role === "superadmin"

  let query = supabase
    .from("tactics_boards")
    .select("*")
    .order("updated_at", { ascending: false })

  if (!isCoach) {
    // Players only see published boards for their teams
    query = query.eq("is_published", true)
    if (teamId) {
      query = query.eq("team_id", teamId)
    } else {
      // Get teams the user is on
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("profile_id", user.id)
      const teamIds = teamMembers?.map((tm) => tm.team_id) ?? []
      if (teamIds.length > 0) {
        query = query.in("team_id", teamIds)
      } else {
        return NextResponse.json({ data: [] })
      }
    }
  } else if (teamId) {
    query = query.eq("team_id", teamId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "coach" && profile.role !== "superadmin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from("tactics_boards")
    .insert({
      name: body.name ?? "Untitled Board",
      kind: body.kind ?? "formation",
      field_type: body.field_type ?? "futsal_rounded",
      team_id: body.team_id ?? null,
      state_json: body.state_json ?? { players: [], arrows: [], labels: [] },
      is_published: body.is_published ?? false,
      created_by: user.id,
    })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "coach" && profile.role !== "superadmin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()

  if (!body.id) {
    return NextResponse.json({ error: "Missing board id" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("tactics_boards")
    .update({
      name: body.name,
      kind: body.kind,
      field_type: body.field_type,
      team_id: body.team_id,
      state_json: body.state_json,
      is_published: body.is_published,
    })
    .eq("id", body.id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "coach" && profile.role !== "superadmin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const { error } = await supabase.from("tactics_boards").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
