import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { fetchWithTimeout } from "./fetch-with-timeout"
import type { Database } from "@/types/database"

/**
 * Cookieless anon client for PUBLIC, cacheable reads (token resolution on public
 * pages). It carries no session, so its results are safe to wrap in unstable_cache.
 * RLS still applies as the `anon` role. Never use for member-scoped data.
 */
export function createAnonClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchWithTimeout },
    },
  )
}
