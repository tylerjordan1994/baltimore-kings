import { redirect } from "next/navigation"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { FeesManager, type FeeItem, type Assignment, type Team, type Player } from "./fees-manager"

export default async function FeesAdmin() {
  try {
    await requireRole("coach")
  } catch {
    redirect("/app")
  }
  const supabase = await createClient()
  const [{ data: fees }, { data: assignments }, { data: teams }, { data: players }] = await Promise.all([
    supabase.from("fee_items").select("id, title, amount_cents, purpose, applies_to").not("title", "is", null).order("created_at", { ascending: false }),
    supabase.from("fee_assignments").select("id, fee_item_id, status, profiles(full_name)").order("created_at", { ascending: false }),
    supabase.from("teams").select("id, name").eq("is_active", true).order("display_order"),
    supabase.from("profiles").select("id, full_name").in("role", ["player", "coach", "superadmin"]).order("full_name"),
  ])
  return (
    <FeesManager
      fees={(fees ?? []) as FeeItem[]}
      assignments={(assignments ?? []) as unknown as Assignment[]}
      teams={(teams ?? []) as Team[]}
      players={(players ?? []) as Player[]}
    />
  )
}
