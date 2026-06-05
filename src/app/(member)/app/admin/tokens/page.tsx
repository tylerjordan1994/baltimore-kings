import { redirect } from "next/navigation"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { TokensManager, type TokenRow } from "./tokens-manager"

export default async function TokensAdmin() {
  try {
    await requireRole("coach")
  } catch {
    redirect("/app")
  }
  const supabase = await createClient()

  const [{ data: tokenData }, { data: pageData }, { data: teamData }] = await Promise.all([
    supabase.from("content_tokens").select("id, key, name, description, collection, mode, config").order("name"),
    supabase.from("pages").select("puck_data"),
    supabase.from("teams").select("slug, name").eq("is_active", true).order("display_order"),
  ])

  const tokens = (tokenData ?? []) as TokenRow[]
  const teams = (teamData ?? []) as { slug: string; name: string }[]

  // Usage: how many pages reference each token key (binding or inline tag).
  const usage: Record<string, number> = {}
  const pages = (pageData ?? []) as { puck_data: unknown }[]
  for (const t of tokens) {
    usage[t.key] = pages.filter((p) => JSON.stringify(p.puck_data ?? "").includes(`"${t.key}"`) || JSON.stringify(p.puck_data ?? "").includes(`[${t.key}]`)).length
  }

  return <TokensManager initial={tokens} usage={usage} teams={teams} />
}
