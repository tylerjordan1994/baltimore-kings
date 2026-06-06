import { redirect } from "next/navigation"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { SponsorsManager, type Sponsor } from "./sponsors-manager"

export default async function SponsorsAdmin() {
  try {
    await requireRole("coach")
  } catch {
    redirect("/app")
  }
  const supabase = await createClient()
  const { data } = await supabase
    .from("sponsors")
    .select("id, name, logo_url, website_url, tier, description, is_active, order_index")
    .order("order_index", { ascending: true })
  return <SponsorsManager sponsors={(data ?? []) as Sponsor[]} />
}
