import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const basePath = "/project/football-team"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as "signup" | "email" | "recovery" | "invite" | null
  const next = searchParams.get("next") ?? `${basePath}/app`

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If verification fails, redirect to sign-in
  return NextResponse.redirect(`${origin}${basePath}/sign-in`)
}
