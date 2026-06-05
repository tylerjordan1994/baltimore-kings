import { notFound, redirect } from "next/navigation"
import type { Data } from "@measured/puck"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { PageEditor } from "@/components/puck/page-editor"

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("coach")
  } catch {
    redirect("/app")
  }
  const { id } = await params
  const supabase = await createClient()
  const { data: page } = await supabase.from("pages").select("id, slug, puck_data").eq("id", id).maybeSingle()
  if (!page) notFound()
  const p = page as { id: string; slug: string; puck_data: Data }
  return <PageEditor pageId={p.id} slug={p.slug} initialData={p.puck_data} />
}
