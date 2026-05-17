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

  if (profile.role === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
        <div className="mx-auto max-w-md rounded-xl border border-amber-500/30 bg-zinc-900 p-8 text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <h1 className="mb-2 text-xl font-bold text-white">
            Account Pending Approval
          </h1>
          <p className="text-zinc-400">
            Your account is awaiting coach approval. You will receive an email
            once your account has been activated.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <MemberSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  )
}
