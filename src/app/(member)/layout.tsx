import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MemberSidebar } from "./member-sidebar"
import { MemberTopbar } from "./member-topbar"

// basePath handled by next.config.ts

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login`)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect(`/login`)
  }

  if (profile.status === "pending" || profile.role === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-8">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-white p-8 text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <h1 className="mb-2 text-xl font-bold text-ink">
            Account Pending Approval
          </h1>
          <p className="text-muted-foreground">
            Your account is awaiting coach approval. You&apos;ll receive an email
            once your account has been activated.
          </p>
        </div>
      </div>
    )
  }

  // Check brand assets for superadmins
  let brandUploaded = true
  if (profile.role === "superadmin") {
    const { data: brand } = await supabase
      .from("brand_assets")
      .select("logo_full_url, logo_mark_url, logo_white_url")
      .limit(1)
      .single()

    // Consider branding done once any primary logo exists (the others are optional variants).
    brandUploaded = !!(brand?.logo_full_url || brand?.logo_mark_url)
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <MemberSidebar profile={profile} brandUploaded={brandUploaded} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MemberTopbar profile={profile} />
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
