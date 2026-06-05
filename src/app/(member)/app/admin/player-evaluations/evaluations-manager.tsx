"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BASE = "/project/football-team"
const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")

export type Criterion = { key: string; label: string; type: "rating_1_5" | "text" | "number"; group?: string }
export type Template = { id: string; name: string; criteria: Criterion[] }
export type Player = { id: string; full_name: string }

export function EvaluationsManager({ templates, players }: { templates: Template[]; players: Player[] }) {
  const [tab, setTab] = useState<"evaluate" | "templates">("evaluate")
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 font-heading text-3xl text-ink">Player Evaluations</h1>
      <p className="mb-5 text-sm text-muted-foreground">Build templates, evaluate players, share results.</p>
      <div className="mb-6 flex gap-2">
        <Tab on={tab === "evaluate"} onClick={() => setTab("evaluate")}>Evaluate</Tab>
        <Tab on={tab === "templates"} onClick={() => setTab("templates")}>Templates ({templates.length})</Tab>
      </div>
      {tab === "evaluate" ? <Evaluate templates={templates} players={players} /> : <Templates templates={templates} />}
    </div>
  )
}

function Tab({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${on ? "bg-brand text-paper" : "border border-border text-ink"}`}>{children}</button>
}

/* ── Evaluate ── */
function Evaluate({ templates, players }: { templates: Template[]; players: Player[] }) {
  const router = useRouter()
  const [templateId, setTemplateId] = useState("")
  const [playerId, setPlayerId] = useState("")
  const [season, setSeason] = useState("2025-2026")
  const [visibility, setVisibility] = useState<"coach_only" | "shared">("coach_only")
  const [scores, setScores] = useState<Record<string, unknown>>({})
  const [note, setNote] = useState("")
  const [msg, setMsg] = useState("")
  const tmpl = templates.find((t) => t.id === templateId)
  const input = "rounded-lg border border-border bg-background px-2 py-1.5 text-sm"

  async function save() {
    setMsg("Saving…")
    const res = await fetch(`${BASE}/api/cms/evaluations`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ profile_id: playerId, template_id: templateId || null, season, scores, summary_note: note || null, visibility }),
    })
    setMsg(res.ok ? "Saved ✓" : "Error")
    if (res.ok) { setScores({}); setNote(""); router.refresh() }
  }

  if (templates.length === 0) return <p className="text-sm text-muted-foreground">Create a template first (Templates tab).</p>

  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Template
          <select className={input} value={templateId} onChange={(e) => { setTemplateId(e.target.value); setScores({}) }}>
            <option value="">— select —</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Player
          <select className={input} value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            <option value="">— select —</option>
            {players.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Season
          <input className={input} value={season} onChange={(e) => setSeason(e.target.value)} />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Visibility
          <select className={input} value={visibility} onChange={(e) => setVisibility(e.target.value as "coach_only" | "shared")}>
            <option value="coach_only">Coach only</option><option value="shared">Shared with player</option>
          </select>
        </label>
      </div>

      {tmpl ? (
        <div className="grid gap-2 rounded-lg border border-border bg-paper/40 p-4">
          {tmpl.criteria.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink">{c.label}{c.group ? <span className="ml-1 text-xs text-muted-foreground">({c.group})</span> : null}</span>
              {c.type === "rating_1_5" ? (
                <select className={input} value={String(scores[c.key] ?? "")} onChange={(e) => setScores({ ...scores, [c.key]: Number(e.target.value) })}>
                  <option value="">—</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              ) : c.type === "number" ? (
                <input className={`${input} w-24`} type="number" value={String(scores[c.key] ?? "")} onChange={(e) => setScores({ ...scores, [c.key]: Number(e.target.value) })} />
              ) : (
                <input className={`${input} w-48`} value={String(scores[c.key] ?? "")} onChange={(e) => setScores({ ...scores, [c.key]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
      ) : null}

      <textarea className="min-h-20 rounded-lg border border-border bg-background p-2 text-sm" placeholder="Summary note…" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={!templateId || !playerId} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-paper disabled:opacity-50">Save evaluation</button>
        <span className="text-sm text-muted-foreground">{msg}</span>
      </div>
    </div>
  )
}

/* ── Templates ── */
function Templates({ templates }: { templates: Template[] }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [rows, setRows] = useState<Criterion[]>([{ key: "ball_control", label: "Ball control", type: "rating_1_5", group: "Technical" }])
  const input = "rounded-lg border border-border bg-background px-2 py-1.5 text-sm"

  async function create() {
    const res = await fetch(`${BASE}/api/cms/eval-templates`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, criteria: rows.filter((r) => r.label) }),
    })
    if (res.ok) { setName(""); setRows([]); router.refresh() }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-xl border border-border bg-card p-5">
        <input className={input} placeholder="Template name (e.g. Quarterly Technical Review)" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid gap-2">
          {rows.map((r, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input className={`${input} w-44`} placeholder="Criterion label" value={r.label} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, label: e.target.value, key: slugify(e.target.value) } : x))} />
              <select className={input} value={r.type} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, type: e.target.value as Criterion["type"] } : x))}>
                <option value="rating_1_5">Rating 1–5</option><option value="number">Number</option><option value="text">Text</option>
              </select>
              <input className={`${input} w-32`} placeholder="Group" value={r.group ?? ""} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, group: e.target.value } : x))} />
              <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-xs text-red-600">remove</button>
            </div>
          ))}
          <button onClick={() => setRows([...rows, { key: "", label: "", type: "rating_1_5" }])} className="justify-self-start rounded-full border border-border px-3 py-1 text-xs">+ Add criterion</button>
        </div>
        <button onClick={create} disabled={!name || rows.filter((r) => r.label).length === 0} className="justify-self-start rounded-full bg-brand px-5 py-2 text-sm font-semibold text-paper disabled:opacity-50">Create template</button>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {templates.map((t) => (
          <li key={t.id} className="flex items-center justify-between p-3 text-sm">
            <span className="font-medium text-ink">{t.name}</span>
            <span className="text-muted-foreground">{t.criteria.length} criteria</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
