import "server-only"
import { createClient } from "@/lib/supabase/server"

/**
 * Instagram integration — thin client for the `instagram` Supabase Edge
 * Function, which holds all privileged logic (token storage in
 * integration_secrets, 30-day token refresh, media sync into social_posts).
 * The edge function runs with the service role injected by Supabase, so the
 * Next.js app only ever needs the anon key. Management actions (connect /
 * disconnect / status) forward the signed-in coach's JWT; the function
 * verifies it via is_coach_or_admin().
 */

export type InstagramStatus = {
  connected: boolean
  username: string | null
  lastSyncedAt: string | null
  lastError: string | null
  postCount: number
}

export type SyncResult = { synced: number; skipped: boolean; error: string | null }

async function callEdge<T>(body: Record<string, unknown>, accessToken?: string): Promise<T> {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/instagram`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: anon,
      Authorization: `Bearer ${accessToken ?? anon}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error ?? `Instagram service error (HTTP ${res.status})`)
  return json as T
}

/** The signed-in user's JWT, forwarded so the edge function can check their role. */
async function callerToken(): Promise<string | undefined> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

/** Hourly-throttled sync; safe to call from cron or any request path. */
export async function syncInstagram({ force = false } = {}): Promise<SyncResult> {
  return callEdge<SyncResult>({ action: "sync", force })
}

export async function instagramStatus(): Promise<InstagramStatus> {
  return callEdge<InstagramStatus>({ action: "status" }, await callerToken())
}

/** Validate and store a long-lived token, then run an initial sync. */
export async function connectInstagram(token: string): Promise<InstagramStatus> {
  return callEdge<InstagramStatus>({ action: "connect", token }, await callerToken())
}

/** Remove the connection. Synced posts are kept. */
export async function disconnectInstagram(): Promise<InstagramStatus> {
  return callEdge<InstagramStatus>({ action: "disconnect" }, await callerToken())
}
