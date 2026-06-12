import "server-only"
import { createServiceClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Instagram Platform API (Instagram Login) integration.
 *
 * A coach pastes a long-lived access token once (Site Settings → Social &
 * Brand → Instagram). Recent media is synced into `social_posts`
 * (source 'instagram'), which the homepage and "social" content tokens
 * already render. The long-lived token (60-day expiry) is auto-refreshed
 * whenever it is older than 30 days. Secrets live in `integration_secrets`,
 * which has RLS enabled and no policies — service-role access only.
 */

const GRAPH = "https://graph.instagram.com"
const TOKEN_KEY = "instagram_access_token"
const REFRESHED_KEY = "instagram_token_refreshed_at"
const SYNCED_KEY = "instagram_last_synced_at"
const USERNAME_KEY = "instagram_username"
const ERROR_KEY = "instagram_last_error"

const SYNC_STALE_MS = 60 * 60 * 1000 // re-sync at most hourly
const REFRESH_AFTER_MS = 30 * 24 * 60 * 60 * 1000 // refresh token after 30 days
const MEDIA_LIMIT = 24

type Secrets = Record<string, string>

async function getSecrets(supabase: SupabaseClient): Promise<Secrets> {
  const { data } = await supabase.from("integration_secrets").select("key, value")
  return Object.fromEntries(((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value]))
}

async function setSecret(supabase: SupabaseClient, key: string, value: string) {
  await supabase
    .from("integration_secrets")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
}

async function deleteSecrets(supabase: SupabaseClient, keys: string[]) {
  await supabase.from("integration_secrets").delete().in("key", keys)
}

export type InstagramStatus = {
  connected: boolean
  username: string | null
  lastSyncedAt: string | null
  lastError: string | null
  postCount: number
}

export async function instagramStatus(): Promise<InstagramStatus> {
  const supabase = await createServiceClient()
  const secrets = await getSecrets(supabase)
  const { count } = await supabase
    .from("social_posts")
    .select("*", { count: "exact", head: true })
    .eq("source", "instagram")
  return {
    connected: !!secrets[TOKEN_KEY],
    username: secrets[USERNAME_KEY] ?? null,
    lastSyncedAt: secrets[SYNCED_KEY] ?? null,
    lastError: secrets[ERROR_KEY] ?? null,
    postCount: count ?? 0,
  }
}

/** Validate and store a long-lived token, then run an initial sync. */
export async function connectInstagram(token: string): Promise<InstagramStatus> {
  const res = await fetch(`${GRAPH}/me?fields=id,username&access_token=${encodeURIComponent(token)}`)
  const json = await res.json()
  if (!res.ok || !json.username) {
    throw new Error(json?.error?.message ?? "Instagram rejected the token. Make sure it's a long-lived Instagram API token for a professional account.")
  }
  const supabase = await createServiceClient()
  await setSecret(supabase, TOKEN_KEY, token)
  await setSecret(supabase, REFRESHED_KEY, new Date().toISOString())
  await setSecret(supabase, USERNAME_KEY, json.username)
  await deleteSecrets(supabase, [ERROR_KEY, SYNCED_KEY])
  await syncInstagram({ force: true })
  return instagramStatus()
}

/** Remove the connection. Synced posts are kept (delete them in Social Studio if unwanted). */
export async function disconnectInstagram(): Promise<void> {
  const supabase = await createServiceClient()
  await deleteSecrets(supabase, [TOKEN_KEY, REFRESHED_KEY, USERNAME_KEY, SYNCED_KEY, ERROR_KEY])
}

async function refreshTokenIfNeeded(supabase: SupabaseClient, secrets: Secrets): Promise<string> {
  const token = secrets[TOKEN_KEY]
  const refreshedAt = Date.parse(secrets[REFRESHED_KEY] ?? "") || 0
  if (Date.now() - refreshedAt < REFRESH_AFTER_MS) return token
  const res = await fetch(
    `${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`,
  )
  const json = await res.json()
  if (res.ok && json.access_token) {
    await setSecret(supabase, TOKEN_KEY, json.access_token)
    await setSecret(supabase, REFRESHED_KEY, new Date().toISOString())
    return json.access_token
  }
  // Refresh failed — keep the old token; it may still work until expiry.
  return token
}

type IgMedia = {
  id: string
  caption?: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
}

export type SyncResult = { synced: number; skipped: boolean; error: string | null }

/** Pull recent media into social_posts. No-ops when not connected or recently synced. */
export async function syncInstagram({ force = false } = {}): Promise<SyncResult> {
  const supabase = await createServiceClient()
  const secrets = await getSecrets(supabase)
  if (!secrets[TOKEN_KEY]) return { synced: 0, skipped: true, error: null }

  const lastSynced = Date.parse(secrets[SYNCED_KEY] ?? "") || 0
  if (!force && Date.now() - lastSynced < SYNC_STALE_MS) {
    return { synced: 0, skipped: true, error: null }
  }

  const token = await refreshTokenIfNeeded(supabase, secrets)
  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
  const res = await fetch(`${GRAPH}/me/media?fields=${fields}&limit=${MEDIA_LIMIT}&access_token=${encodeURIComponent(token)}`)
  const json = await res.json()

  if (!res.ok) {
    const msg: string = json?.error?.message ?? `Instagram API error (HTTP ${res.status})`
    await setSecret(supabase, ERROR_KEY, msg)
    return { synced: 0, skipped: false, error: msg }
  }

  const media = (json.data ?? []) as IgMedia[]
  const now = new Date().toISOString()
  const rows = media.map((m) => ({
    external_id: m.id,
    source: "instagram",
    caption: m.caption?.slice(0, 500) ?? null,
    // Video media_url is an mp4; use the thumbnail for the grid image.
    media_url: (m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url) ?? m.thumbnail_url ?? null,
    external_url: m.permalink,
    posted_at: m.timestamp,
    synced_at: now,
  }))

  if (rows.length > 0) {
    const { error } = await supabase.from("social_posts").upsert(rows, { onConflict: "external_id" })
    if (error) {
      await setSecret(supabase, ERROR_KEY, error.message)
      return { synced: 0, skipped: false, error: error.message }
    }
  }

  await setSecret(supabase, SYNCED_KEY, now)
  await deleteSecrets(supabase, [ERROR_KEY])
  return { synced: rows.length, skipped: false, error: null }
}
