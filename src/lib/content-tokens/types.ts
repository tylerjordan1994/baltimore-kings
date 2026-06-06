import { z } from "zod"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export type Audience = "public" | "member"

export interface ResolveContext {
  audience: Audience
  supabase: SupabaseClient<Database>
}

/* ── Normalized return shapes (documented in CMS-AND-TOKENS.md) ── */

export interface PlayerCardItem {
  id: string
  slug: string | null
  name: string
  jerseyNumber: number | null
  positionPrimary: string | null
  positionSecondary: string | null
  photoUrl: string | null
  teams: { name: string; slug: string }[]
}

export interface EventItem {
  id: string
  title: string
  kind: string
  startsAt: string
  endsAt: string | null
  location: string | null
  opponent: string | null
  homeOrAway: "home" | "away" | null
  teamNames: string[]
  result: string | null
  ctaUrl: string | null
  ctaLabel: string | null
}

export interface SponsorItem {
  id: string
  name: string
  logoUrl: string | null
  websiteUrl: string | null
  tier: string | null
  description: string | null
}

export interface AchievementItem {
  id: string
  title: string
  description: string | null
  date: string | null
  season: string | null
  photoUrl: string | null
  kind: string
}
export interface MediaItemNorm {
  id: string
  kind: string
  url: string
  caption: string | null
  takenAt: string | null
}
export interface SocialItem {
  id: string
  source: string | null
  caption: string | null
  mediaUrl: string | null
  externalUrl: string | null
  embedHtml: string | null
  postedAt: string | null
}
export interface LearnItem {
  id: string
  slug: string
  title: string
  summary: string | null
  category: string | null
  coverImageUrl: string | null
}
export interface TeamItem {
  id: string
  name: string
  slug: string
  league: string
  season: string | null
}

/** Discriminated payload returned by resolveToken(). `value` mode returns a scalar. */
export type ResolvedPayload =
  | { collection: "players"; items: PlayerCardItem[] }
  | { collection: "events"; items: EventItem[] }
  | { collection: "sponsors"; items: SponsorItem[] }
  | { collection: "achievements"; items: AchievementItem[] }
  | { collection: "media"; items: MediaItemNorm[] }
  | { collection: "social"; items: SocialItem[] }
  | { collection: "learn"; items: LearnItem[] }
  | { collection: "teams"; items: TeamItem[] }
  | { collection: "value"; value: string | number | null }
  | { collection: "empty"; items: never[]; note?: string }

/* ── Config schemas (validated with zod; invalid config → safe empty result) ── */

export const playersDynamicConfig = z.object({
  teamId: z.string().uuid().optional(),
  teamSlug: z.string().optional(),
  includeRoles: z.array(z.string()).default(["player", "coach_also_plays"]),
  rosterStatus: z.enum(["active", "all"]).default("active"),
  sort: z.enum(["jersey_asc", "name_asc"]).default("jersey_asc"),
  limit: z.number().int().positive().max(200).optional(),
})

export const eventsDynamicConfig = z.object({
  scope: z.enum(["public", "members"]).default("public"),
  when: z.enum(["upcoming", "past", "all"]).default("upcoming"),
  teamIds: z.array(z.string().uuid()).optional(),
  sort: z.enum(["starts_at_asc", "starts_at_desc"]).default("starts_at_asc"),
  limit: z.number().int().positive().max(100).optional(),
})

export const sponsorsDynamicConfig = z.object({
  activeOnly: z.boolean().default(true),
  tier: z.string().optional(),
  sort: z.enum(["order_index_asc", "name_asc"]).default("order_index_asc"),
  limit: z.number().int().positive().max(100).optional(),
})

/** Generic dynamic filter for the simpler collections. */
export const genericDynamicConfig = z.object({
  activeOnly: z.boolean().default(true),
  sort: z.enum(["recent", "order", "name"]).default("recent"),
  limit: z.number().int().positive().max(100).optional(),
})

export const curatedConfig = z.object({
  ids: z.array(z.string().uuid()).default([]),
})

export const valueConfig = z.union([
  z.object({ value: z.union([z.string(), z.number()]) }),
  z.object({ settingKey: z.string() }),
  z.object({ compute: z.enum(["next_match", "club_record"]) }),
])

/** Maps a token `collection` to the block prop key the resolved data is exposed under. */
export const COLLECTIONS = [
  "players",
  "events",
  "sponsors",
  "achievements",
  "media",
  "social",
  "merch",
  "learn",
  "teams",
  "value",
] as const
export type Collection = (typeof COLLECTIONS)[number]
