import "server-only"
import { createAnonClient } from "@/lib/supabase/anon"

const BASE = "/project/football-team"

export type NavLink = { label: string; href: string; isCta: boolean; external: boolean }

type NavRow = {
  label: string
  link_type: string
  external_url: string | null
  page_id: string | null
  is_cta: boolean
  order_index: number
}

/**
 * Public nav links for a menu, resolved from nav_items (RLS limits anon to
 * active + public). Page links resolve to their slug; URL links pass through.
 * Returns [] when the menu is unconfigured, so callers can fall back.
 */
export async function getPublicNav(menuKey: string): Promise<NavLink[]> {
  const supabase = createAnonClient()
  const { data } = await supabase
    .from("nav_items")
    .select("label, link_type, external_url, page_id, is_cta, order_index")
    .eq("menu_key", menuKey)
    .eq("is_active", true)
    .eq("visibility", "public")
    .order("order_index", { ascending: true })

  const rows = (data ?? []) as NavRow[]
  if (rows.length === 0) return []

  const pageIds = rows.filter((r) => r.link_type === "page" && r.page_id).map((r) => r.page_id as string)
  const slugById = new Map<string, string>()
  if (pageIds.length) {
    const { data: pages } = await supabase.from("pages").select("id, slug").in("id", pageIds)
    for (const p of (pages ?? []) as { id: string; slug: string }[]) slugById.set(p.id, p.slug)
  }

  return rows.map((r) => {
    const href =
      r.link_type === "page" && r.page_id ? `${BASE}/${slugById.get(r.page_id) ?? ""}` : r.external_url ?? "#"
    const external = /^https?:\/\//.test(href)
    return { label: r.label, href, isCta: r.is_cta, external }
  })
}
