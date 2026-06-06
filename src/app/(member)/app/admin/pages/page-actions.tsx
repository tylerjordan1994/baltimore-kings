"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BASE = "/project/football-team"

type Revision = { id: string; created_at: string }

export function PageActions({
  id,
  slug,
  status,
  isHome,
}: {
  id: string
  slug: string
  status: string
  isHome: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [revs, setRevs] = useState<Revision[] | null>(null)

  async function act(action: string) {
    if (action === "delete" && !confirm("Delete this page? This cannot be undone.")) return
    setBusy(true)
    const res = await fetch(`${BASE}/api/cms/pages/${id}/actions`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)
    if (action === "duplicate" && json.id) router.push(`/app/admin/pages/${json.id}/edit`)
    else router.refresh()
  }

  async function openRevs() {
    const res = await fetch(`${BASE}/api/cms/pages/${id}/revisions`)
    const json = await res.json().catch(() => ({ revisions: [] }))
    setRevs(json.revisions ?? [])
  }

  async function restore(revisionId: string) {
    if (!confirm("Restore this revision? Current content is snapshotted first.")) return
    await fetch(`${BASE}/api/cms/pages/${id}/revisions`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ revisionId }),
    })
    setRevs(null)
    router.refresh()
  }

  const link = "text-xs font-medium hover:underline disabled:opacity-40"

  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5">
      <a href={`/app/admin/pages/${id}/edit`} className={`${link} text-accent-dark`}>Edit</a>
      <button disabled={busy} onClick={() => act(status === "published" ? "unpublish" : "publish")} className={`${link} text-foreground`}>
        {status === "published" ? "Unpublish" : "Publish"}
      </button>
      {!isHome ? <button disabled={busy} onClick={() => act("set-home")} className={`${link} text-foreground`}>Set home</button> : null}
      <button disabled={busy} onClick={() => act("duplicate")} className={`${link} text-foreground`}>Duplicate</button>
      <button disabled={busy} onClick={openRevs} className={`${link} text-foreground`}>Revisions</button>
      <button disabled={busy} onClick={() => act("delete")} className={`${link} text-red-600`}>Delete</button>
      {status === "published" ? (
        <a href={`${BASE}/${slug}`} target="_blank" rel="noreferrer" className={`${link} text-muted-foreground`}>View</a>
      ) : null}

      {revs ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRevs(null)}>
          <div className="max-h-[70vh] w-full max-w-md overflow-auto rounded-xl bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 font-heading text-lg text-foreground">Revisions</h3>
            {revs.length === 0 ? <p className="text-sm text-muted-foreground">No revisions yet. Publishing creates a snapshot.</p> : (
              <ul className="divide-y divide-border">
                {revs.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                    <button onClick={() => restore(r.id)} className="font-medium text-accent-dark hover:underline">Restore</button>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setRevs(null)} className="mt-4 rounded-full border border-border px-4 py-1.5 text-sm">Close</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
