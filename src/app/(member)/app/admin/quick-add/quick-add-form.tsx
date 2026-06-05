"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BASE = "/project/football-team"
const PLACEHOLDER = `7, John Doe, futsal-kings-1, Pivot, steaks
10, Jane Smith, masl3, Defender
?, Alex Young, futsal-kings-2, Winger, injured minor`

export function QuickAddForm() {
  const router = useRouter()
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ added: number; results: { line: string; ok: boolean; error?: string }[] } | null>(null)

  async function submit() {
    setBusy(true); setResult(null)
    const res = await fetch(`${BASE}/api/cms/players/quick-add`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }),
    })
    const json = await res.json().catch(() => ({ error: "failed" }))
    setBusy(false)
    if (res.ok) { setResult(json); setText(""); router.refresh() }
    else setResult({ added: 0, results: [{ line: json.error ?? "error", ok: false }] })
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-border bg-paper/40 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-ink">Format — one player per line:</p>
        <code className="mt-1 block">jersey, Full Name, team-slug, position, flags</code>
        <p className="mt-2">Use <code>?</code> or blank for unknown. Flags (space-separated, optional): <code>steaks</code>, <code>injured</code>, <code>minor</code>. Teams: <code>futsal-kings-1</code>, <code>futsal-kings-2</code>, <code>masl3</code>.</p>
      </div>
      <textarea
        className="min-h-48 w-full rounded-xl border border-border bg-background p-3 font-mono text-sm"
        placeholder={PLACEHOLDER}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={submit} disabled={busy || !text.trim()} className="justify-self-start rounded-full bg-brand px-6 py-2 text-sm font-semibold text-paper disabled:opacity-50">
        {busy ? "Adding…" : "Add players"}
      </button>
      {result ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-ink">Added {result.added} player{result.added === 1 ? "" : "s"}.</p>
          <ul className="mt-2 space-y-1 text-sm">
            {result.results.map((r, i) => (
              <li key={i} className={r.ok ? "text-green-700" : "text-red-600"}>{r.ok ? "✓" : "✗"} {r.line}{r.error ? ` — ${r.error}` : ""}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
