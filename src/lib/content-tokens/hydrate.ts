import "server-only"
import type { ResolveContext, ResolvedPayload } from "./types"
import { resolveToken } from "./resolve"
import { resolvePublicTokenCached } from "./cache"
import { sanitizeEmbed } from "@/lib/sanitize-embed"

/** Minimal Puck document shape we walk. */
interface PuckBlock {
  type: string
  props: Record<string, unknown> & { id?: string; token?: string }
}
export interface PuckData {
  root?: { props?: Record<string, unknown> } & Record<string, unknown>
  content?: PuckBlock[]
  zones?: Record<string, PuckBlock[]>
}

const VALUE_TAG = /\[([a-z0-9][a-z0-9-]*)\]/g

function allBlocks(doc: PuckData): PuckBlock[] {
  const blocks: PuckBlock[] = [...(doc.content ?? [])]
  if (doc.zones) for (const z of Object.values(doc.zones)) blocks.push(...z)
  return blocks
}

/**
 * Server pass: resolve every data-bound block's token and inject the result onto
 * `props._resolved`, and replace inline `[value-token]` merge tags inside string
 * props with their scalar. Resolution is fresh on every render (cached by tag for
 * public). The inverse, stripResolved(), runs on save so only bindings persist.
 */
export async function hydrateTokens(input: PuckData, ctx: ResolveContext): Promise<PuckData> {
  const doc: PuckData = structuredClone(input)
  const blocks = allBlocks(doc)

  // Collect referenced token keys: explicit bindings + inline value tags.
  const boundKeys = new Set<string>()
  const valueTagKeys = new Set<string>()
  for (const b of blocks) {
    if (typeof b.props?.token === "string" && b.props.token) boundKeys.add(b.props.token)
    for (const v of Object.values(b.props ?? {})) {
      if (typeof v === "string") {
        for (const m of v.matchAll(VALUE_TAG)) valueTagKeys.add(m[1])
      }
    }
  }
  if (boundKeys.size === 0 && valueTagKeys.size === 0) return doc

  // One lookup for collection/mode of every referenced key.
  const allKeys = [...new Set([...boundKeys, ...valueTagKeys])]
  const { data: tokenRows } = await ctx.supabase
    .from("content_tokens")
    .select("key, collection, mode")
    .in("key", allKeys)
  const meta = new Map(
    ((tokenRows ?? []) as { key: string; collection: string; mode: string }[]).map((r) => [r.key, r]),
  )

  const resolveOne = (key: string, collection: string): Promise<ResolvedPayload> =>
    ctx.audience === "public" ? resolvePublicTokenCached(key, collection) : resolveToken(key, ctx)

  // Resolve bound tokens → attach _resolved.
  await Promise.all(
    blocks.map(async (b) => {
      const key = b.props?.token
      if (typeof key !== "string" || !key) return
      const m = meta.get(key)
      const payload = m ? await resolveOne(key, m.collection) : null
      b.props._resolved = payload ?? { collection: "empty", items: [] }
    }),
  )

  // Resolve inline value tags → build a scalar map.
  const valueMap = new Map<string, string>()
  await Promise.all(
    [...valueTagKeys].map(async (key) => {
      const m = meta.get(key)
      if (!m || m.collection !== "value") return
      const payload = await resolveOne(key, "value")
      if (payload.collection === "value" && payload.value != null) {
        valueMap.set(key, String(payload.value))
      }
    }),
  )
  if (valueMap.size) {
    const replace = (s: string) => s.replace(VALUE_TAG, (full, k) => (valueMap.has(k) ? valueMap.get(k)! : full))
    for (const b of blocks) {
      for (const [k, v] of Object.entries(b.props ?? {})) {
        if (typeof v === "string") b.props[k] = replace(v)
      }
    }
  }

  return doc
}

/**
 * Prepare a doc for persistence: drop resolved data (only bindings are saved)
 * and sanitize any EmbedHTML so unsafe markup is never even stored.
 */
export function stripResolved(input: PuckData): PuckData {
  const doc: PuckData = structuredClone(input)
  for (const b of allBlocks(doc)) {
    if (b.props && "_resolved" in b.props) delete b.props._resolved
    if (b.type === "EmbedHTML" && typeof b.props?.html === "string") {
      b.props.html = sanitizeEmbed(b.props.html as string)
    }
  }
  return doc
}
