import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const basePath = "/project/football-team"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? `${basePath}/app`

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If code exchange fails, redirect to sign-in with error
  return NextResponse.redirect(`${origin}${basePath}/sign-in`)
}
