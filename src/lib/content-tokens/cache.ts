import "server-only"
import { unstable_cache, revalidateTag, revalidatePath } from "next/cache"
import { createAnonClient } from "@/lib/supabase/anon"
import { resolveToken } from "./resolve"
import type { ResolvedPayload } from "./types"

export const TOKEN_TAG = "content-tokens"
export const collectionTag = (c: string) => `token-collection:${c}`
export const tokenTag = (key: string) => `token:${key}`

/**
 * Public token resolution, cached by tag. Uses the cookieless anon client so the
 * result is shareable across visitors. Tagged by the token key and its collection
 * so the right mutation can bust the right cache (see REVALIDATION_MAP).
 */
export function resolvePublicTokenCached(key: string, collection: string): Promise<ResolvedPayload> {
  const run = unstable_cache(
    async () => resolveToken(key, { audience: "public", supabase: createAnonClient() }),
    ["content-token", key],
    { tags: [TOKEN_TAG, tokenTag(key), collectionTag(collection)], revalidate: 300 },
  )
  return run()
}

/**
 * Which token collections a write to a given table affects. A mutation handler
 * calls revalidateContent(table) so only the impacted token caches are busted.
 */
export const REVALIDATION_MAP: Record<string, string[]> = {
  team_members: ["players"],
  profiles: ["players"],
  calendar_events: ["events"],
  games: ["events"],
  sponsors: ["sponsors"],
  achievements: ["achievements"],
  media_items: ["media"],
  social_posts: ["social"],
  learn_pages: ["learn"],
  teams: ["teams", "players"],
  site_settings: ["value"],
  content_tokens: ["*"], // token definition changed → bust everything
}

/** Bust the token caches affected by a write to `table`. Call from server actions / webhooks. */
export function revalidateContent(table: string) {
  const cols = REVALIDATION_MAP[table]
  if (!cols) return
  // Next 16: revalidateTag takes a cache-life profile as the 2nd arg.
  if (cols.includes("*")) {
    revalidateTag(TOKEN_TAG, "max")
    return
  }
  for (const c of cols) revalidateTag(collectionTag(c), "max")
}

/** Revalidate a published page's public path (call on publish). */
export function revalidatePagePath(slug: string) {
  revalidatePath(slug === "" ? "/" : `/${slug}`)
}
