"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BASE = "/project/football-team"
const TIERS = ["platinum", "gold", "silver", "community"]

export type Sponsor = {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  tier: string | null
  description: string | null
  is_active: boolean
  order_index: number | null
}

export function SponsorsManager({ sponsors }: { sponsors: Sponsor[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Sponsor | "new" | null>(null)

  async function del(id: string) {
    if (!confirm("Delete this sponsor?")) return
    await fetch(`${BASE}/api/cms/sponsors/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-ink">Sponsors</h1>
          <p className="text-sm text-muted-foreground">Add sponsors — they appear anywhere a sponsors token is bound (homepage, footer, pages).</p>
        </div>
        <button onClick={() => setEditing("new")} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-paper">New sponsor</button>
      </div>

      {editing ? <SponsorForm sponsor={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); router.refresh() }} /> : null}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-paper/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-2.5">Sponsor</th><th className="px-4 py-2.5">Tier</th><th className="px-4 py-2.5">Active</th><th className="px-4 py-2.5"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sponsors.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No sponsors yet.</td></tr> : null}
            {sponsors.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{s.tier}</td>
                <td className="px-4 py-3">{s.is_active ? "✓" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(s)} className="font-semibold text-accent-dark hover:underline">Edit</button>
                  <button onClick={() => del(s.id)} className="ml-3 text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SponsorForm({ sponsor, onClose, onSaved }: { sponsor: Sponsor | null; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState({
    name: sponsor?.name ?? "",
    logo_url: sponsor?.logo_url ?? "",
    website_url: sponsor?.website_url ?? "",
    tier: sponsor?.tier ?? "gold",
    description: sponsor?.description ?? "",
    is_active: sponsor?.is_active ?? true,
    order_index: sponsor?.order_index ?? 0,
  })
  const [msg, setMsg] = useState("")
  const set = (p: Partial<typeof d>) => setD((prev) => ({ ...prev, ...p }))
  const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"

  async function save() {
    setMsg("Saving…")
    const url = sponsor ? `${BASE}/api/cms/sponsors/${sponsor.id}` : `${BASE}/api/cms/sponsors`
    const res = await fetch(url, { method: sponsor ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...d, order_index: Number(d.order_index) }) })
    setMsg(res.ok ? "Saved ✓" : "Error")
    if (res.ok) onSaved()
  }

  return (
    <div className="mb-6 grid gap-3 rounded-xl border border-accent/40 bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={input} placeholder="Sponsor name" value={d.name} onChange={(e) => set({ name: e.target.value })} />
        <select className={input} value={d.tier} onChange={(e) => set({ tier: e.target.value })}>{TIERS.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}</select>
        <input className={input} placeholder="Logo URL" value={d.logo_url} onChange={(e) => set({ logo_url: e.target.value })} />
        <input className={input} placeholder="Website URL" value={d.website_url} onChange={(e) => set({ website_url: e.target.value })} />
        <input className={input} type="number" placeholder="Order" value={d.order_index} onChange={(e) => set({ order_index: Number(e.target.value) })} />
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={d.is_active} onChange={(e) => set({ is_active: e.target.checked })} /> Active</label>
      </div>
      <textarea className={input} placeholder="Description (optional)" value={d.description} onChange={(e) => set({ description: e.target.value })} />
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
        <button onClick={save} disabled={!d.name} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-paper disabled:opacity-50">{sponsor ? "Save" : "Add sponsor"}</button>
        <span className="text-sm text-muted-foreground">{msg}</span>
      </div>
    </div>
  )
}
