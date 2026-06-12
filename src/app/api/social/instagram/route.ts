import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { connectInstagram, disconnectInstagram, instagramStatus, syncInstagram } from "@/lib/instagram"

/**
 * GET — opportunistic sync (hit by the Vercel cron daily and safe to call any
 * time): syncs at most once an hour, returns counts only. No auth needed —
 * it exposes no data and is idempotent.
 */
export async function GET() {
  try {
    const result = await syncInstagram()
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "sync failed"
    return NextResponse.json({ synced: 0, skipped: true, error: msg }, { status: 503 })
  }
}

const postSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("connect"), token: z.string().min(20) }),
  z.object({ action: z.literal("sync") }),
  z.object({ action: z.literal("disconnect") }),
  z.object({ action: z.literal("status") }),
])

/** POST — coach-only management actions from the admin Social page. */
export async function POST(request: Request) {
  try {
    await requireRole("coach")
    const body = postSchema.parse(await request.json())

    if (body.action === "connect") {
      const status = await connectInstagram(body.token.trim())
      return NextResponse.json(status)
    }
    if (body.action === "sync") {
      const result = await syncInstagram({ force: true })
      if (result.error) return NextResponse.json({ error: result.error }, { status: 502 })
      return NextResponse.json(await instagramStatus())
    }
    if (body.action === "disconnect") {
      await disconnectInstagram()
      return NextResponse.json(await instagramStatus())
    }
    return NextResponse.json(await instagramStatus())
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
