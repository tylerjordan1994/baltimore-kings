import { redirect } from "next/navigation"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { NavEditor, type NavItem } from "./nav-editor"

export default async function NavigationAdmin() {
  try {
    await requireRole("coach")
  } catch {
    redirect("/app")
  }
  const supabase = await createClient()
  const [{ data: nav }, { data: pages }] = await Promise.all([
    supabase.from("nav_items").select("*").order("order_index"),
    supabase.from("pages").select("id, title, slug").order("title"),
  ])
  return <NavEditor items={(nav ?? []) as NavItem[]} pages={(pages ?? []) as { id: string; title: string; slug: string }[]} />
}
