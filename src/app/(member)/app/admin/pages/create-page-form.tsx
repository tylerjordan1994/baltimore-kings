"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BASE = "/project/football-team"
const slugify = (v: string) =>
  v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

export function CreatePageForm() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr("")
    const res = await fetch(`${BASE}/api/cms/pages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, slug: slug || slugify(title) }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)
    if (res.ok && json.id) router.push(`/app/admin/pages/${json.id}/edit`)
    else setErr(json.error ?? "Could not create page")
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
      <div className="grid gap-1">
        <label className="text-xs font-semibold text-muted-foreground">Title</label>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setSlug(slugify(e.target.value))
          }}
          placeholder="About the Club"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-semibold text-muted-foreground">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          placeholder="about-the-club"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-paper disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create & edit"}
      </button>
      {err ? <span className="text-sm text-red-600">{err}</span> : null}
    </form>
  )
}
