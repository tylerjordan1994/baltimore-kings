import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAnonClient } from "@/lib/supabase/anon"
import { resolveToken } from "@/lib/content-tokens/resolve"
import { resolvePublicTokenCached } from "@/lib/content-tokens/cache"

/**
 * RLS-gated token resolution for client islands that need a token AFTER an
 * interaction (filters, "load more"). NOT used for first paint — pages hydrate
 * tokens server-side. Members resolve under their session; everyone else gets
 * the cached public result.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token: key } = await params
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) {
    return NextResponse.json({ error: "invalid token key" }, { status: 400 })
  }

  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()

  let member = false
  if (user) {
    const { data: prof } = await session.from("profiles").select("role").eq("id", user.id).maybeSingle()
    member = !!prof && ["player", "coach", "superadmin"].includes((prof as { role: string }).role)
  }

  if (member) {
    const payload = await resolveToken(key, { audience: "member", supabase: session })
    return NextResponse.json(payload)
  }

  // Public: need the collection to tag the cache correctly.
  const { data: meta } = await createAnonClient().from("content_tokens").select("collection").eq("key", key).maybeSingle()
  const collection = (meta as { collection: string } | null)?.collection ?? "value"
  const payload = await resolvePublicTokenCached(key, collection)
  return NextResponse.json(payload)
}
