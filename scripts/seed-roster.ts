/**
 * Seed script for Baltimore Kings roster data.
 *
 * Usage:
 *   npx tsx scripts/seed-roster.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const ROSTER = [
  { full_name: "Josh Danza", role: "player", status: "active" },
  { full_name: "Gavin Boyer", role: "player", status: "active" },
  { full_name: "Pat Fleming", role: "player", status: "active" },
  { full_name: "Antonios Araviakis", role: "player", status: "active" },
  { full_name: "Axel Bax", role: "player", status: "active" },
  { full_name: "Ken Truong", role: "player", status: "active" },
  { full_name: "Henry Scott", role: "player", status: "active" },
  { full_name: "David Boretti", role: "player", status: "active" },
  { full_name: "Max Cerulla", role: "player", status: "active" },
  { full_name: "Brandon Alexander", role: "player", status: "active" },
  { full_name: "Lucasz Kalkowski", role: "player", status: "active" },
  { full_name: "Chris Kin", role: "player", status: "active" },
  { full_name: "Carson Shamoo", role: "player", status: "active" },
]

async function main() {
  console.log("Fetching futsal-kings-1 team...")

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", "futsal-kings-1")
    .single()

  if (teamError || !team) {
    console.error("Could not find team with slug 'futsal-kings-1':", teamError?.message)
    process.exit(1)
  }

  console.log(`Found team: ${team.id}`)
  console.log("Upserting profiles...")

  for (const player of ROSTER) {
    // Upsert profile by full_name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        { full_name: player.full_name, role: player.role, status: player.status },
        { onConflict: "full_name" }
      )
      .select("id")
      .single()

    if (profileError || !profile) {
      console.error(`  Failed to upsert profile for ${player.full_name}:`, profileError?.message)
      continue
    }

    // Add to team_members
    const { error: memberError } = await supabase
      .from("team_members")
      .upsert(
        {
          team_id: team.id,
          profile_id: profile.id,
          status: "active",
        },
        { onConflict: "team_id,profile_id" }
      )

    if (memberError) {
      console.error(`  Failed to add ${player.full_name} to team:`, memberError.message)
    } else {
      console.log(`  Added ${player.full_name}`)
    }
  }

  console.log("Done!")
}

main()
