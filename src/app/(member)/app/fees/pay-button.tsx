"use client"

import { useState } from "react"

const BASE = "/project/football-team"

export function PayButton({ assignmentId }: { assignmentId: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  async function pay() {
    setBusy(true); setErr("")
    const res = await fetch(`${BASE}/api/fees/checkout`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ assignment_id: assignmentId }),
    })
    const json = await res.json().catch(() => ({}))
    if (res.ok && json.url) window.location.href = json.url
    else { setBusy(false); setErr(json.error ?? "Payment unavailable") }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={pay} disabled={busy} className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-paper disabled:opacity-50">
        {busy ? "Redirecting…" : "Pay"}
      </button>
      {err ? <span className="text-xs text-red-600">{err}</span> : null}
    </div>
  )
}
