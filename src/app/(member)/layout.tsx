import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MemberSidebar } from "./member-sidebar"

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

    brandUploaded = !!(brand?.logo_full_url && brand?.logo_mark_url && brand?.logo_white_url)
  }

  return (
    <div className="dark flex min-h-screen bg-court">
      <MemberSidebar profile={profile} brandUploaded={brandUploaded} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
