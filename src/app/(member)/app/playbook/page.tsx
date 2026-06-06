import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PlaybookGrid, type Play } from "./playbook-grid"

export default async function PlaybookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // RLS: members can read published boards.
  const { data } = await supabase
    .from("tactics_boards")
    .select("id, name, kind, preview_image_url")
    .eq("is_published", true)
    .order("kind")
    .order("name")

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 font-heading text-3xl text-ink">Playbook</h1>
      <p className="mb-6 text-sm text-muted-foreground">Formations, set pieces, and plays your coaches have shared.</p>
      <PlaybookGrid plays={(data ?? []) as Play[]} />
    </div>
  )
}
