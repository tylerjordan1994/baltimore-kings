import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient, createServiceClient } from "@/lib/supabase/server"

const schema = z.object({ text: z.string().min(1) })

/**
 * Bulk-add roster players from a pasted block, one player per line:
 *   jersey, Full Name, team-slug, position, flags
 * Use `?` or blank for unknown. flags (space-separated, optional): steaks injured minor.
 * Example:  7, John Doe, futsal-kings-1, Pivot, steaks
 *
 * Creates a roster player (auth user with a placeholder email, since profiles.id
 * is FK to auth.users) + profile + team assignment. Uses the service client
 * inside this coach-gated route (a trusted server action). The coach can attach
 * a real email later so the player can claim their login.
 */
export async function POST(request: Request) {
  try {
    await requireRole("coach")
    const { text } = schema.parse(await request.json())

    // Resolve team slugs -> ids up front (session client; RLS-safe read).
    const session = await createClient()
    const { data: teams } = await session.from("teams").select("id, slug")
    const teamBySlug = new Map(((teams ?? []) as { id: string; slug: string }[]).map((t) => [t.slug, t.id]))

    const svc = await createServiceClient()
    const results: { line: string; ok: boolean; error?: string }[] = []

    for (const raw of text.split("\n").map((l) => l.trim()).filter(Boolean)) {
      const parts = raw.split(",").map((p) => p.trim())
      const [jerseyRaw, name, teamSlug, position, flagsRaw] = parts
      const clean = (v?: string) => (!v || v === "?" ? undefined : v)
      const fullName = clean(name)
      if (!fullName) { results.push({ line: raw, ok: false, error: "missing name" }); continue }

      const flags = (flagsRaw ?? "").toLowerCase()
      const jersey = clean(jerseyRaw)?.replace(/[^0-9]/g, "")

      // profiles.id is FK to auth.users — create an auth user first.
      const email = `roster.${crypto.randomUUID()}@baltimore-kings.invalid`
      const { data: created, error: uErr } = await svc.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      })
      const id = created?.user?.id
      if (uErr || !id) { results.push({ line: raw, ok: false, error: uErr?.message ?? "could not create account" }); continue }

      // The signup trigger may pre-create a profile row; upsert the roster fields.
      const { error: pErr } = await svc.from("profiles").upsert({
        id,
        full_name: fullName,
        role: "player",
        status: flags.includes("injured") ? "injured" : "active",
        jersey_number: jersey ? Number(jersey) : null,
        position_primary: clean(position) ?? null,
        also_plays_for_steaks: flags.includes("steaks"),
        is_minor: flags.includes("minor"),
        approved_at: new Date().toISOString(),
      })
      if (pErr) { results.push({ line: raw, ok: false, error: pErr.message }); continue }

      const teamId = clean(teamSlug) ? teamBySlug.get(clean(teamSlug)!) : undefined
      if (teamId) {
        await svc.from("team_members").insert({
          team_id: teamId,
          profile_id: id,
          is_active: true,
          jersey_number_for_team: jersey ? Number(jersey) : null,
          position: clean(position) ?? null,
        })
      }
      results.push({ line: raw, ok: true })
    }

    return NextResponse.json({ added: results.filter((r) => r.ok).length, results })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
