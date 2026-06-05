"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BASE = "/project/football-team"
const money = (c: number) => `$${(c / 100).toFixed(2)}`

export type FeeItem = { id: string; title: string | null; amount_cents: number; purpose: string; applies_to: string }
export type Assignment = { id: string; fee_item_id: string; status: string; profiles: { full_name: string } | null }
export type Team = { id: string; name: string }
export type Player = { id: string; full_name: string }

export function FeesManager({ fees, assignments, teams, players }: { fees: FeeItem[]; assignments: Assignment[]; teams: Team[]; players: Player[] }) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 font-heading text-3xl text-ink">Fees</h1>
      <p className="mb-6 text-sm text-muted-foreground">Create a fee, assign it to a team or players, and track payment.</p>
      <CreateFee teams={teams} players={players} />
      <div className="mt-8 grid gap-4">
        {fees.length === 0 ? <p className="text-sm text-muted-foreground">No fees yet.</p> : null}
        {fees.map((f) => <FeeCard key={f.id} fee={f} assignments={assignments.filter((a) => a.fee_item_id === f.id)} />)}
      </div>
    </div>
  )
}

function CreateFee({ teams, players }: { teams: Team[]; players: Player[] }) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState("dues")
  const [appliesTo, setAppliesTo] = useState<"team" | "players">("team")
  const [teamId, setTeamId] = useState("")
  const [picked, setPicked] = useState<string[]>([])
  const [msg, setMsg] = useState("")
  const input = "rounded-lg border border-border bg-background px-2 py-1.5 text-sm"

  async function create() {
    setMsg("Creating…")
    const res = await fetch(`${BASE}/api/cms/fees`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title, amount_cents: Math.round(parseFloat(amount || "0") * 100), purpose, applies_to: appliesTo,
        team_id: appliesTo === "team" ? teamId || null : null,
        profile_ids: appliesTo === "players" ? picked : undefined,
      }),
    })
    const json = await res.json().catch(() => ({}))
    setMsg(res.ok ? `Created — ${json.assigned} assigned` : json.error ?? "Error")
    if (res.ok) { setTitle(""); setAmount(""); setPicked([]); router.refresh() }
  }

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={input} placeholder="Fee title (e.g. Spring Dues)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={input} type="number" step="0.01" placeholder="Amount (USD)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select className={input} value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          {["dues", "ref_fee", "practice_fee", "tournament_fee", "other"].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className={input} value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as "team" | "players")}>
          <option value="team">A whole team</option><option value="players">Specific players</option>
        </select>
      </div>
      {appliesTo === "team" ? (
        <select className={input} value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          <option value="">— select team —</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      ) : (
        <select multiple className={`${input} h-32`} value={picked} onChange={(e) => setPicked(Array.from(e.currentTarget.selectedOptions).map((o) => o.value))}>
          {players.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
      )}
      <div className="flex items-center gap-3">
        <button onClick={create} disabled={!title || !amount} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-paper disabled:opacity-50">Create & assign</button>
        <span className="text-sm text-muted-foreground">{msg}</span>
      </div>
    </div>
  )
}

function FeeCard({ fee, assignments }: { fee: FeeItem; assignments: Assignment[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const counts = {
    outstanding: assignments.filter((a) => a.status === "outstanding").length,
    paid: assignments.filter((a) => a.status === "paid").length,
    waived: assignments.filter((a) => a.status === "waived").length,
  }

  async function waive(id: string, status: string) {
    await fetch(`${BASE}/api/cms/fees/assignments/${id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }),
    })
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between">
        <div className="text-left">
          <p className="font-medium text-ink">{fee.title} <span className="text-muted-foreground">· {money(fee.amount_cents)}</span></p>
          <p className="text-xs text-muted-foreground">{counts.outstanding} outstanding · {counts.paid} paid · {counts.waived} waived</p>
        </div>
        <span className="text-muted-foreground">{open ? "▲" : "▼"}</span>
      </button>
      {open ? (
        <ul className="mt-3 divide-y divide-border border-t border-border">
          {assignments.length === 0 ? <li className="py-3 text-sm text-muted-foreground">No assignments.</li> : null}
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink">{a.profiles?.full_name ?? "Player"}</span>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "paid" ? "bg-green-100 text-green-800" : a.status === "waived" ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-800"}`}>{a.status}</span>
                {a.status === "outstanding" ? <button onClick={() => waive(a.id, "waived")} className="text-xs text-muted-foreground hover:underline">Waive</button> : null}
                {a.status === "waived" ? <button onClick={() => waive(a.id, "outstanding")} className="text-xs text-muted-foreground hover:underline">Reopen</button> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
