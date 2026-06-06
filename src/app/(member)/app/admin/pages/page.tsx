import { redirect } from "next/navigation"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { CreatePageForm } from "./create-page-form"
import { PageActions } from "./page-actions"

type PageRow = {
  id: string
  slug: string
  title: string
  status: string
  visibility: string
  is_home: boolean
  updated_at: string
}

export default async function PagesAdmin() {
  try {
    await requireRole("coach")
  } catch {
    redirect("/app")
  }
  const supabase = await createClient()
  const { data } = await supabase
    .from("pages")
    .select("id, slug, title, status, visibility, is_home, updated_at")
    .order("updated_at", { ascending: false })
  const pages = (data ?? []) as PageRow[]

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 font-heading text-3xl text-ink">Pages</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Compose pages visually with Puck. Bind data-bound blocks to content tokens to show live rosters, schedules, and more.
      </p>

      <div className="mb-8">
        <CreatePageForm />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="bg-paper/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Slug</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Visibility</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pages.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No pages yet. Create one above.</td></tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-ink">
                    {p.title} {p.is_home ? <span className="ml-1 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] uppercase text-accent-dark">Home</span> : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">/{p.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "published" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.visibility}</td>
                  <td className="px-4 py-3">
                    <PageActions id={p.id} slug={p.slug} status={p.status} isHome={p.is_home} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
