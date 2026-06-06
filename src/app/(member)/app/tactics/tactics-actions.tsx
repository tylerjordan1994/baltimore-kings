"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BASE = "/project/football-team"

export function NewPlayButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  async function create() {
    setBusy(true)
    const res = await fetch(`${BASE}/api/tactics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "My new play", kind: "play", field_type: "futsal_rounded" }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)
    if (json.data?.id) router.push(`/app/tactics/${json.data.id}`)
    else alert(json.error ?? "Could not create play")
  }
  return (
    <button onClick={create} disabled={busy} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50">
      {busy ? "Creating…" : "+ New play"}
    </button>
  )
}

export function ShareButton({ boardId, members }: { boardId: string; members: { id: string; full_name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const [msg, setMsg] = useState("")

  async function share() {
    setMsg("Sharing…")
    const res = await fetch(`${BASE}/api/tactics/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board_id: boardId, profile_ids: picked }),
    })
    setMsg(res.ok ? "Shared ✓" : "Error")
    if (res.ok) setTimeout(() => setOpen(false), 800)
  }

  return (
    <>
      <button onClick={(e) => { e.preventDefault(); setOpen(true) }} className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700">Share</button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-lg font-bold text-white">Share play</h3>
            <p className="mb-2 text-xs text-zinc-500">Pick players or coaches to share this play with.</p>
            <select multiple value={picked} onChange={(e) => setPicked(Array.from(e.currentTarget.selectedOptions).map((o) => o.value))}
              className="h-48 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-sm text-white">
              {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => setOpen(false)} className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">Cancel</button>
              <button onClick={share} disabled={picked.length === 0} className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">Share</button>
              <span className="text-sm text-zinc-400">{msg}</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
