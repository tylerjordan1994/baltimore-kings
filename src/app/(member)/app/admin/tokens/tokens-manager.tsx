"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

const BASE = "/project/football-team"
const COLLECTIONS = ["players", "events", "sponsors", "achievements", "media", "social", "learn", "teams", "value"] as const
const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

export type TokenRow = {
  id: string
  key: string
  name: string
  description: string | null
  collection: string
  mode: string
  config: Record<string, unknown>
}

export function TokensManager({
  initial,
  usage,
  teams,
}: {
  initial: TokenRow[]
  usage: Record<string, number>
  teams: { slug: string; name: string }[]
}) {
  const [editing, setEditing] = useState<TokenRow | "new" | null>(null)
  const router = useRouter()

  async function del(id: string) {
    if (!confirm("Delete this token? Pages bound to it will show their empty state.")) return
    await fetch(`${BASE}/api/cms/tokens/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-ink">Content Tokens</h1>
          <p className="text-sm text-muted-foreground">Named handles that bind blocks to live data.</p>
        </div>
        <button onClick={() => setEditing("new")} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-paper">
          New token
        </button>
      </div>

      {editing ? (
        <TokenWizard
          token={editing === "new" ? null : editing}
          teams={teams}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh() }}
        />
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-paper/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-2.5">Token</th><th className="px-4 py-2.5">Collection</th><th className="px-4 py-2.5">Mode</th><th className="px-4 py-2.5">Used on</th><th className="px-4 py-2.5"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initial.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No tokens yet.</td></tr>
            ) : initial.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3"><div className="font-medium text-ink">{t.name}</div><code className="text-xs text-muted-foreground">[{t.key}]</code></td>
                <td className="px-4 py-3 text-muted-foreground">{t.collection}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.mode}</td>
                <td className="px-4 py-3 text-muted-foreground">{usage[t.key] ?? 0} page{(usage[t.key] ?? 0) === 1 ? "" : "s"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(t)} className="font-semibold text-accent-dark hover:underline">Edit</button>
                  <button onClick={() => del(t.id)} className="ml-3 text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Wizard ─────────────────────────────────────────────── */

type Draft = {
  key: string
  name: string
  description: string
  collection: string
  mode: string
  config: Record<string, unknown>
}

function defaultConfig(collection: string, mode: string): Record<string, unknown> {
  if (mode === "curated") return { ids: [] }
  if (collection === "value") return { settingKey: "founded_year" }
  if (collection === "players") return { sort: "jersey_asc" }
  if (collection === "events") return { scope: "public", when: "upcoming", sort: "starts_at_asc", limit: 10 }
  if (collection === "sponsors") return { activeOnly: true, sort: "order_index_asc" }
  return { activeOnly: true, sort: "recent" }
}

function TokenWizard({
  token,
  teams,
  onClose,
  onSaved,
}: {
  token: TokenRow | null
  teams: { slug: string; name: string }[]
  onClose: () => void
  onSaved: () => void
}) {
  const [d, setD] = useState<Draft>(() => ({
    key: token?.key ?? "",
    name: token?.name ?? "",
    description: token?.description ?? "",
    collection: token?.collection ?? "players",
    mode: token?.mode ?? "dynamic",
    config: token?.config ?? defaultConfig(token?.collection ?? "players", token?.mode ?? "dynamic"),
  }))
  const [preview, setPreview] = useState<{ count: number; note?: string } | null>(null)
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)

  const set = (patch: Partial<Draft>) => setD((p) => ({ ...p, ...patch }))
  const setCfg = (patch: Record<string, unknown>) => setD((p) => ({ ...p, config: { ...p.config, ...patch } }))

  // Reset config when collection/mode changes (only meaningful for new tokens).
  function changeCollection(collection: string) {
    set({ collection, config: defaultConfig(collection, collection === "value" ? "value" : d.mode), mode: collection === "value" ? "value" : d.mode })
  }
  function changeMode(mode: string) {
    set({ mode, config: defaultConfig(d.collection, mode) })
  }

  // Live preview (debounced).
  const cfgKey = useMemo(() => JSON.stringify({ c: d.collection, m: d.mode, cfg: d.config }), [d.collection, d.mode, d.config])
  useEffect(() => {
    // Value tokens show a static message (not driven by `preview`), so skip fetching.
    if (d.collection === "value") return
    const id = setTimeout(async () => {
      const res = await fetch(`${BASE}/api/cms/tokens/preview`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ collection: d.collection, mode: d.mode, config: d.config }),
      })
      const json = await res.json().catch(() => ({}))
      if (json.collection === "value") setPreview({ count: json.value != null ? 1 : 0 })
      else setPreview({ count: Array.isArray(json.items) ? json.items.length : 0, note: json.note })
    }, 350)
    return () => clearTimeout(id)
  }, [cfgKey, d.collection, d.mode, d.config])

  async function save() {
    setBusy(true); setErr("")
    const key = d.key || slugify(d.name)
    const payload = { key, name: d.name, description: d.description || null, collection: d.collection, mode: d.mode, config: d.config }
    const url = token ? `${BASE}/api/cms/tokens/${token.id}` : `${BASE}/api/cms/tokens`
    const res = await fetch(url, { method: token ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
    const json = await res.json().catch(() => ({}))
    setBusy(false)
    if (res.ok) onSaved()
    else setErr(json.error ?? "Could not save token")
  }

  const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
  const label = "text-xs font-semibold text-muted-foreground"

  return (
    <div className="mb-6 rounded-xl border border-accent/40 bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-1">
          <span className={label}>Name</span>
          <input className={input} value={d.name} onChange={(e) => set({ name: e.target.value, key: token ? d.key : slugify(e.target.value) })} placeholder="First Team Roster" />
        </div>
        <div className="grid gap-1">
          <span className={label}>Key</span>
          <input className={input} value={d.key} onChange={(e) => set({ key: slugify(e.target.value) })} placeholder="first-team-roster" />
        </div>
        <div className="grid gap-1">
          <span className={label}>Collection</span>
          <select className={input} value={d.collection} onChange={(e) => changeCollection(e.target.value)} disabled={!!token}>
            {COLLECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid gap-1">
          <span className={label}>Mode</span>
          <select className={input} value={d.mode} onChange={(e) => changeMode(e.target.value)} disabled={d.collection === "value" || !!token}>
            {(d.collection === "value" ? ["value"] : ["dynamic", "curated"]).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-paper/40 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Configuration</p>
        <ConfigEditor d={d} teams={teams} setCfg={setCfg} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {d.collection === "value" ? "Resolves to a single value." : preview ? `Live preview: ${preview.count} result${preview.count === 1 ? "" : "s"}${preview.note ? ` (${preview.note})` : ""}` : "Resolving…"}
        </span>
        <div className="ml-auto flex gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={save} disabled={busy || !d.name} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-paper disabled:opacity-50">
            {busy ? "Saving…" : token ? "Save changes" : "Create token"}
          </button>
        </div>
      </div>
      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
    </div>
  )
}

function ConfigEditor({
  d,
  teams,
  setCfg,
}: {
  d: Draft
  teams: { slug: string; name: string }[]
  setCfg: (patch: Record<string, unknown>) => void
}) {
  const cfg = d.config as Record<string, unknown>
  const sel = "rounded-lg border border-border bg-background px-2 py-1.5 text-sm"

  if (d.mode === "curated") {
    return (
      <div className="grid gap-1">
        <span className="text-xs text-muted-foreground">Record IDs (one per line, in display order)</span>
        <textarea className="min-h-24 w-full rounded-lg border border-border bg-background p-2 font-mono text-xs"
          value={(Array.isArray(cfg.ids) ? (cfg.ids as string[]) : []).join("\n")}
          onChange={(e) => setCfg({ ids: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
      </div>
    )
  }

  if (d.collection === "value") {
    const kind = "value" in cfg ? "literal" : "compute" in cfg ? "computed" : "setting"
    return (
      <div className="flex flex-wrap items-center gap-3">
        <select className={sel} value={kind} onChange={(e) => {
          const k = e.target.value
          setCfg(k === "literal" ? { value: "", settingKey: undefined, compute: undefined } : k === "computed" ? { compute: "next_match", value: undefined, settingKey: undefined } : { settingKey: "founded_year", value: undefined, compute: undefined })
        }}>
          <option value="literal">Literal value</option>
          <option value="setting">Site setting</option>
          <option value="computed">Computed</option>
        </select>
        {kind === "literal" ? <input className={sel} placeholder="value" value={String(cfg.value ?? "")} onChange={(e) => setCfg({ value: e.target.value })} /> : null}
        {kind === "setting" ? <input className={sel} placeholder="founded_year" value={String(cfg.settingKey ?? "")} onChange={(e) => setCfg({ settingKey: e.target.value })} /> : null}
        {kind === "computed" ? (
          <select className={sel} value={String(cfg.compute ?? "next_match")} onChange={(e) => setCfg({ compute: e.target.value })}>
            <option value="next_match">Next match</option>
          </select>
        ) : null}
      </div>
    )
  }

  // dynamic
  return (
    <div className="flex flex-wrap items-end gap-4">
      {d.collection === "players" ? (
        <Field label="Team">
          <select className={sel} value={String(cfg.teamSlug ?? "")} onChange={(e) => setCfg({ teamSlug: e.target.value || undefined })}>
            <option value="">All teams</option>
            {teams.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </Field>
      ) : null}
      {d.collection === "events" ? (
        <>
          <Field label="Scope"><select className={sel} value={String(cfg.scope ?? "public")} onChange={(e) => setCfg({ scope: e.target.value })}><option value="public">Public</option><option value="members">Members</option></select></Field>
          <Field label="When"><select className={sel} value={String(cfg.when ?? "upcoming")} onChange={(e) => setCfg({ when: e.target.value })}><option value="upcoming">Upcoming</option><option value="past">Past</option><option value="all">All</option></select></Field>
        </>
      ) : null}
      <Field label="Sort">
        <select className={sel} value={String(cfg.sort ?? "")} onChange={(e) => setCfg({ sort: e.target.value })}>
          {(d.collection === "players" ? ["jersey_asc", "name_asc"]
            : d.collection === "events" ? ["starts_at_asc", "starts_at_desc"]
            : d.collection === "sponsors" ? ["order_index_asc", "name_asc"]
            : ["recent", "order", "name"]).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Limit">
        <input className={`${sel} w-20`} type="number" min={1} value={cfg.limit != null ? Number(cfg.limit) : ""} onChange={(e) => setCfg({ limit: e.target.value ? Number(e.target.value) : undefined })} />
      </Field>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1"><span className="text-xs text-muted-foreground">{label}</span>{children}</label>
}
