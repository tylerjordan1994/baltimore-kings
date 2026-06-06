import "server-only"
import type { ResolveContext, ResolvedPayload, PlayerCardItem, EventItem, SponsorItem } from "./types"
import {
  playersDynamicConfig,
  eventsDynamicConfig,
  sponsorsDynamicConfig,
  genericDynamicConfig,
  curatedConfig,
  valueConfig,
} from "./types"

const EMPTY: ResolvedPayload = { collection: "empty", items: [] }

type TokenRow = {
  key: string
  collection: string
  mode: string
  config: Record<string, unknown>
}

/**
 * Resolve a content token to typed, normalized data, honoring the audience's
 * RLS via the supplied client. Never throws — invalid config, a missing token,
 * or a backend hiccup all degrade to a safe empty payload so a page never
 * fails to render because of a token.
 */
export async function resolveToken(
  key: string,
  ctx: ResolveContext,
): Promise<ResolvedPayload> {
  const { supabase } = ctx
  const { data: token } = await supabase
    .from("content_tokens")
    .select("key, collection, mode, config")
    .eq("key", key)
    .maybeSingle()

  if (!token) return EMPTY
  const t = token as TokenRow
  return resolveTokenConfig(t.collection, t.mode, (t.config ?? {}) as Record<string, unknown>, ctx)
}

/**
 * Resolve an ad-hoc (collection, mode, config) without a persisted token row.
 * Used by the token wizard's live preview and by resolveToken().
 */
export async function resolveTokenConfig(
  collection: string,
  mode: string,
  config: Record<string, unknown>,
  ctx: ResolveContext,
): Promise<ResolvedPayload> {
  try {
    switch (collection) {
      case "players": return await resolvePlayers(ctx, mode, config)
      case "events": return await resolveEvents(ctx, mode, config)
      case "sponsors": return await resolveSponsors(ctx, mode, config)
      case "achievements": return await resolveAchievements(ctx, config)
      case "media": return await resolveMedia(ctx, config)
      case "social": return await resolveSocial(ctx, config)
      case "learn": return await resolveLearn(ctx, config)
      case "teams": return await resolveTeams(ctx, config)
      case "value": return await resolveValue(ctx, config)
      case "merch": return { collection: "empty", items: [], note: "no merch source in this database" }
      default: return { collection: "empty", items: [], note: `collection '${collection}' not resolved` }
    }
  } catch {
    return EMPTY
  }
}

/* ── players ───────────────────────────────────────────── */

type PublicProfileRow = {
  id: string
  slug: string | null
  full_name: string
  nickname: string | null
  photo_url: string | null
  position_primary: string | null
  position_secondary: string | null
  jersey_number: number | null
  teams: { name: string; slug: string }[] | null
}

function toPlayer(r: PublicProfileRow): PlayerCardItem {
  return {
    id: r.id,
    slug: r.slug,
    name: r.full_name,
    jerseyNumber: r.jersey_number,
    positionPrimary: r.position_primary,
    positionSecondary: r.position_secondary,
    photoUrl: r.photo_url,
    teams: Array.isArray(r.teams) ? r.teams : [],
  }
}

async function resolvePlayers(
  ctx: ResolveContext,
  mode: string,
  rawConfig: Record<string, unknown>,
): Promise<ResolvedPayload> {
  const { supabase } = ctx

  if (mode === "curated") {
    const cfg = curatedConfig.parse(rawConfig)
    if (cfg.ids.length === 0) return { collection: "players", items: [] }
    const { data } = await supabase.from("public_profiles").select("*").in("id", cfg.ids)
    const rows = (data ?? []) as PublicProfileRow[]
    // Preserve the curated order.
    const order = new Map(cfg.ids.map((id, i) => [id, i]))
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    return { collection: "players", items: rows.map(toPlayer) }
  }

  const cfg = playersDynamicConfig.parse(rawConfig)
  let q = supabase.from("public_profiles").select("*")

  // Resolve team filter. Prefer slug (matches the anon-safe view's teams jsonb).
  let teamSlug = cfg.teamSlug
  if (!teamSlug && cfg.teamId) {
    const { data: team } = await supabase.from("teams").select("slug").eq("id", cfg.teamId).maybeSingle()
    teamSlug = (team as { slug: string } | null)?.slug
  }
  // Pass a JSON string: supabase-js formats an array arg as a Postgres array
  // (cs.{...}), which doesn't match a jsonb column. A string uses cs.<json>.
  if (teamSlug) q = q.contains("teams", JSON.stringify([{ slug: teamSlug }]))

  if (cfg.sort === "name_asc") q = q.order("full_name", { ascending: true })
  else q = q.order("jersey_number", { ascending: true, nullsFirst: false })

  if (cfg.limit) q = q.limit(cfg.limit)

  const { data } = await q
  return { collection: "players", items: ((data ?? []) as PublicProfileRow[]).map(toPlayer) }
}

/* ── events ────────────────────────────────────────────── */

type EventRow = {
  id: string
  title: string
  kind: string
  starts_at: string
  ends_at: string | null
  location: string | null
  team_ids: string[] | null
  cta_url: string | null
  cta_label: string | null
}

async function resolveEvents(
  ctx: ResolveContext,
  _mode: string,
  rawConfig: Record<string, unknown>,
): Promise<ResolvedPayload> {
  const { supabase } = ctx
  const cfg = eventsDynamicConfig.parse(rawConfig)
  const nowIso = new Date().toISOString()

  let q = supabase
    .from("calendar_events")
    .select("id, title, kind, starts_at, ends_at, location, team_ids, cta_url, cta_label")
    .eq("visibility", cfg.scope === "members" ? "members_only" : "public")

  if (cfg.when === "upcoming") q = q.gte("starts_at", nowIso)
  else if (cfg.when === "past") q = q.lt("starts_at", nowIso)

  q = q.order("starts_at", { ascending: cfg.sort !== "starts_at_desc" })
  if (cfg.limit) q = q.limit(cfg.limit)

  const { data } = await q
  const rows = (data ?? []) as unknown as EventRow[]

  // Map team ids -> names with a single lookup.
  const ids = [...new Set(rows.flatMap((r) => r.team_ids ?? []))]
  const names = new Map<string, string>()
  if (ids.length) {
    const { data: teams } = await supabase.from("teams").select("id, name").in("id", ids)
    for (const t of (teams ?? []) as { id: string; name: string }[]) names.set(t.id, t.name)
  }

  const items: EventItem[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    kind: r.kind,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    location: r.location,
    opponent: null, // sourced from `games` — wired in a later phase
    homeOrAway: r.kind === "home_game" ? "home" : r.kind === "away_game" ? "away" : null,
    teamNames: (r.team_ids ?? []).map((id) => names.get(id)).filter((n): n is string => !!n),
    result: null,
    ctaUrl: r.cta_url,
    ctaLabel: r.cta_label,
  }))
  return { collection: "events", items }
}

/* ── sponsors ──────────────────────────────────────────── */

type SponsorRow = {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  tier: string | null
  description: string | null
}

async function resolveSponsors(
  ctx: ResolveContext,
  _mode: string,
  rawConfig: Record<string, unknown>,
): Promise<ResolvedPayload> {
  const { supabase } = ctx
  const cfg = sponsorsDynamicConfig.parse(rawConfig)
  let q = supabase.from("sponsors").select("id, name, logo_url, website_url, tier, description")
  if (cfg.activeOnly) q = q.eq("is_active", true)
  if (cfg.tier) q = q.eq("tier", cfg.tier)
  if (cfg.sort === "name_asc") q = q.order("name", { ascending: true })
  else q = q.order("order_index", { ascending: true, nullsFirst: false })
  if (cfg.limit) q = q.limit(cfg.limit)

  const { data } = await q
  const items: SponsorItem[] = ((data ?? []) as SponsorRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    logoUrl: r.logo_url,
    websiteUrl: r.website_url,
    tier: r.tier,
    description: r.description,
  }))
  return { collection: "sponsors", items }
}

/* ── value ─────────────────────────────────────────────── */

async function resolveValue(
  ctx: ResolveContext,
  rawConfig: Record<string, unknown>,
): Promise<ResolvedPayload> {
  const { supabase } = ctx
  const cfg = valueConfig.parse(rawConfig)

  if ("value" in cfg) return { collection: "value", value: cfg.value }

  if ("settingKey" in cfg) {
    const { data } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle()
    const s = (data ?? {}) as Record<string, unknown>
    const direct = s[cfg.settingKey]
    if (direct !== undefined && direct !== null) return { collection: "value", value: direct as string | number }
    const fromJson = (s.settings as Record<string, unknown> | undefined)?.[cfg.settingKey]
    return { collection: "value", value: (fromJson as string | number | null) ?? null }
  }

  // (computed below)
  return resolveValueComputed(ctx, cfg)
}

async function resolveValueComputed(
  ctx: ResolveContext,
  cfg: { compute: "next_match" | "club_record" },
): Promise<ResolvedPayload> {
  const { supabase } = ctx
  if (cfg.compute === "next_match") {
    const { data } = await supabase
      .from("calendar_events")
      .select("title, starts_at")
      .eq("visibility", "public")
      .in("kind", ["home_game", "away_game"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle()
    const row = data as { title: string; starts_at: string } | null
    if (!row) return { collection: "value", value: null }
    const d = new Date(row.starts_at)
    return { collection: "value", value: `${row.title} — ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` }
  }

  return { collection: "value", value: null }
}

/* ── achievements / media / social / learn / teams ─────── */

async function resolveAchievements(ctx: ResolveContext, raw: Record<string, unknown>): Promise<ResolvedPayload> {
  const c = genericDynamicConfig.parse(raw)
  let q = ctx.supabase
    .from("achievements")
    .select("id, kind, title, description, achievement_date, season, photo_url, display_order")
    .eq("is_archived", false)
  q = c.sort === "order" ? q.order("display_order", { ascending: true })
    : c.sort === "name" ? q.order("title", { ascending: true })
    : q.order("achievement_date", { ascending: false, nullsFirst: false })
  if (c.limit) q = q.limit(c.limit)
  const { data } = await q
  type R = { id: string; kind: string; title: string; description: string | null; achievement_date: string | null; season: string | null; photo_url: string | null }
  return {
    collection: "achievements",
    items: ((data ?? []) as R[]).map((r) => ({ id: r.id, title: r.title, description: r.description, date: r.achievement_date, season: r.season, photoUrl: r.photo_url, kind: r.kind })),
  }
}

async function resolveMedia(ctx: ResolveContext, raw: Record<string, unknown>): Promise<ResolvedPayload> {
  const c = genericDynamicConfig.parse(raw)
  let q = ctx.supabase.from("media_items").select("id, kind, url, caption, taken_at")
  q = c.sort === "name" ? q.order("caption", { ascending: true }) : q.order("taken_at", { ascending: false, nullsFirst: false })
  if (c.limit) q = q.limit(c.limit)
  const { data } = await q
  type R = { id: string; kind: string; url: string; caption: string | null; taken_at: string | null }
  return { collection: "media", items: ((data ?? []) as R[]).map((r) => ({ id: r.id, kind: r.kind, url: r.url, caption: r.caption, takenAt: r.taken_at })) }
}

async function resolveSocial(ctx: ResolveContext, raw: Record<string, unknown>): Promise<ResolvedPayload> {
  const c = genericDynamicConfig.parse(raw)
  let q = ctx.supabase.from("social_posts").select("id, source, external_url, embed_html, media_url, caption, posted_at").order("posted_at", { ascending: false, nullsFirst: false })
  if (c.limit) q = q.limit(c.limit)
  const { data } = await q
  type R = { id: string; source: string | null; external_url: string | null; embed_html: string | null; media_url: string | null; caption: string | null; posted_at: string | null }
  return { collection: "social", items: ((data ?? []) as R[]).map((r) => ({ id: r.id, source: r.source, caption: r.caption, mediaUrl: r.media_url, externalUrl: r.external_url, embedHtml: r.embed_html, postedAt: r.posted_at })) }
}

async function resolveLearn(ctx: ResolveContext, raw: Record<string, unknown>): Promise<ResolvedPayload> {
  const c = genericDynamicConfig.parse(raw)
  let q = ctx.supabase.from("learn_pages").select("id, slug, title, summary, category, cover_image_url, is_public, order_index")
  if (c.activeOnly && ctx.audience === "public") q = q.eq("is_public", true)
  q = c.sort === "name" ? q.order("title", { ascending: true }) : q.order("order_index", { ascending: true, nullsFirst: false })
  if (c.limit) q = q.limit(c.limit)
  const { data } = await q
  type R = { id: string; slug: string; title: string; summary: string | null; category: string | null; cover_image_url: string | null }
  return { collection: "learn", items: ((data ?? []) as R[]).map((r) => ({ id: r.id, slug: r.slug, title: r.title, summary: r.summary, category: r.category, coverImageUrl: r.cover_image_url })) }
}

async function resolveTeams(ctx: ResolveContext, raw: Record<string, unknown>): Promise<ResolvedPayload> {
  const c = genericDynamicConfig.parse(raw)
  let q = ctx.supabase.from("teams").select("id, name, slug, league, season, is_active, display_order")
  if (c.activeOnly) q = q.eq("is_active", true)
  q = c.sort === "name" ? q.order("name", { ascending: true }) : q.order("display_order", { ascending: true, nullsFirst: false })
  if (c.limit) q = q.limit(c.limit)
  const { data } = await q
  type R = { id: string; name: string; slug: string; league: string; season: string | null }
  return { collection: "teams", items: ((data ?? []) as R[]).map((r) => ({ id: r.id, name: r.name, slug: r.slug, league: r.league, season: r.season })) }
}
