import { redirect } from "next/navigation"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { EvaluationsManager, type Template, type Player } from "./evaluations-manager"

export default async function PlayerEvaluationsAdmin() {
  try {
    await requireRole("coach")
  } catch {
    redirect("/app")
  }
  const supabase = await createClient()
  const [{ data: templates }, { data: players }] = await Promise.all([
    supabase.from("eval_templates").select("id, name, criteria").eq("is_active", true).order("name"),
    supabase.from("profiles").select("id, full_name").in("role", ["player", "coach", "superadmin"]).order("full_name"),
  ])
  return <EvaluationsManager templates={(templates ?? []) as Template[]} players={(players ?? []) as Player[]} />
}
