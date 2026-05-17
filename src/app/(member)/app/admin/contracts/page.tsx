"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Contract, ContractKind, ContractAppliesTo, Profile, Team } from "@/types/database"

type Tab = "active" | "pending" | "expiring" | "expired" | "drafts"

export default function AdminContractsPage() {
  const [tab, setTab] = useState<Tab>("active")
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showAssign, setShowAssign] = useState<string | null>(null)
  const [players, setPlayers] = useState<Profile[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [assignCounts, setAssignCounts] = useState<Record<string, number>>({})

  // Form state
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [kind, setKind] = useState<ContractKind>("player_agreement")
  const [appliesTo, setAppliesTo] = useState<ContractAppliesTo>("individual")
  const [teamId, setTeamId] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Assign state
  const [assignProfileId, setAssignProfileId] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchContracts()
    fetchPlayersAndTeams()
  }, [tab])

  async function fetchPlayersAndTeams() {
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "active")
      .order("full_name")
    setPlayers((p as Profile[]) || [])

    const { data: t } = await supabase
      .from("teams")
      .select("*")
      .eq("is_active", true)
      .order("name")
    setTeams((t as Team[]) || [])
  }

  async function fetchContracts() {
    setLoading(true)
    let query = supabase.from("contracts").select("*")

    const now = new Date().toISOString()
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    if (tab === "active") {
      query = query.eq("is_active", true).or(`expiration_date.is.null,expiration_date.gt.${now}`)
    } else if (tab === "pending") {
      // Contracts that have pending assignments
      query = query.eq("is_active", true)
    } else if (tab === "expiring") {
      query = query.eq("is_active", true).lte("expiration_date", thirtyDays).gt("expiration_date", now)
    } else if (tab === "expired") {
      query = query.lt("expiration_date", now)
    } else {
      query = query.eq("is_active", false)
    }

    const { data } = await query.order("created_at", { ascending: false })
    setContracts(data || [])

    // Fetch assignment counts
    if (data && data.length > 0) {
      const ids = data.map((c: any) => c.id)
      const { data: counts } = await supabase
        .from("contract_assignments")
        .select("contract_id")
        .in("contract_id", ids)

      const map: Record<string, number> = {}
      counts?.forEach((row: any) => {
        map[row.contract_id] = (map[row.contract_id] || 0) + 1
      })
      setAssignCounts(map)
    }

    setLoading(false)
  }

  async function handleCreate() {
    setSubmitting(true)
    const res = await fetch("/api/admin/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_contract",
        title,
        body_markdown: body,
        kind,
        applies_to: appliesTo,
        team_id: appliesTo === "team" ? teamId : null,
        expiration_date: expirationDate || null,
      }),
    })

    if (res.ok) {
      setShowForm(false)
      setTitle("")
      setBody("")
      setExpirationDate("")
      fetchContracts()
    }
    setSubmitting(false)
  }

  async function handleAssign(contractId: string) {
    const contract = contracts.find((c) => c.id === contractId)
    if (!contract) return

    setSubmitting(true)
    const res = await fetch("/api/admin/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "assign",
        contract_id: contractId,
        applies_to: contract.applies_to,
        profile_id: contract.applies_to === "individual" ? assignProfileId : undefined,
        team_id: contract.team_id,
      }),
    })

    if (res.ok) {
      setShowAssign(null)
      setAssignProfileId("")
      fetchContracts()
    }
    setSubmitting(false)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "pending", label: "Pending Signature" },
    { key: "expiring", label: "Expiring Soon" },
    { key: "expired", label: "Expired" },
    { key: "drafts", label: "Drafts" },
  ]

  const kindOptions: ContractKind[] = [
    "player_agreement", "coach_agreement", "tryout_waiver",
    "tournament_release", "code_of_conduct", "other",
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Contracts Manager</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
        >
          Create Contract
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-white/5 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-amber-500 text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contract List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : contracts.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-zinc-500">No contracts found.</p>
          </div>
        ) : (
          contracts.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white">{c.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                      {c.kind}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                      {c.applies_to}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {assignCounts[c.id] || 0} assigned
                    </span>
                  </div>
                  {c.expiration_date && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Expires: {new Date(c.expiration_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowAssign(c.id)}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  Assign
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">Create Contract</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Kind</label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as ContractKind)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {kindOptions.map((k) => (
                      <option key={k} value={k}>{k.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Applies To</label>
                  <select
                    value={appliesTo}
                    onChange={(e) => setAppliesTo(e.target.value as ContractAppliesTo)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Team</option>
                    <option value="all_active">All Active</option>
                  </select>
                </div>
              </div>
              {appliesTo === "team" && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Team</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Select team...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!title.trim() || !body.trim() || submitting}
                  className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-6">
            <h2 className="text-lg font-bold text-white mb-4">Assign Contract</h2>
            {contracts.find((c) => c.id === showAssign)?.applies_to === "individual" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Select Player</label>
                  <select
                    value={assignProfileId}
                    onChange={(e) => setAssignProfileId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Select player...</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 mb-4">
                This will assign to{" "}
                {contracts.find((c) => c.id === showAssign)?.applies_to === "team"
                  ? "all members of the selected team"
                  : "all active players"}
                .
              </p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleAssign(showAssign)}
                disabled={
                  submitting ||
                  (contracts.find((c) => c.id === showAssign)?.applies_to === "individual" && !assignProfileId)
                }
                className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Assigning..." : "Assign"}
              </button>
              <button
                onClick={() => {
                  setShowAssign(null)
                  setAssignProfileId("")
                }}
                className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
