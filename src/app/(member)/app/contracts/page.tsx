"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ContractAssignment, ContractSignature } from "@/types/database"

type Tab = "pending" | "active" | "expired"

export default function ContractsPage() {
  const [tab, setTab] = useState<Tab>("pending")
  const [assignments, setAssignments] = useState<ContractAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [signingId, setSigningId] = useState<string | null>(null)
  const [signatureName, setSignatureName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await fetchAssignments(user.id, tab)
    }
    load()
  }, [tab])

  async function fetchAssignments(uid: string, currentTab: Tab) {
    setLoading(true)
    let query = supabase
      .from("contract_assignments")
      .select("*, contracts(*)")
      .eq("profile_id", uid)

    if (currentTab === "pending") {
      query = query.eq("status", "pending")
    } else if (currentTab === "active") {
      query = query.eq("status", "signed")
    } else {
      query = query.eq("status", "expired")
    }

    const { data } = await query.order("assigned_at", { ascending: false })
    setAssignments((data as ContractAssignment[]) || [])
    setLoading(false)
  }

  async function handleSign() {
    if (!signingId || !signatureName.trim() || !userId) return
    setSubmitting(true)

    const { error } = await supabase.from("contract_signatures").insert({
      contract_assignment_id: signingId,
      signature_text: signatureName.trim(),
      signed_at: new Date().toISOString(),
    })

    if (!error) {
      await supabase
        .from("contract_assignments")
        .update({ status: "signed" })
        .eq("id", signingId)
    }

    setSigningId(null)
    setSignatureName("")
    setSubmitting(false)
    if (userId) fetchAssignments(userId, tab)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pending Signature" },
    { key: "active", label: "Active" },
    { key: "expired", label: "Expired" },
  ]

  const selectedAssignment = assignments.find((a) => a.id === signingId)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Contracts</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-white/5 p-1">
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

      {/* Content */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : assignments.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-zinc-500">No contracts in this category.</p>
          </div>
        ) : (
          assignments.map((a: any) => (
            <div
              key={a.id}
              className="rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white">
                    {a.contracts?.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    Effective: {new Date(a.contracts?.effective_date).toLocaleDateString()}
                    {a.contracts?.expiration_date && (
                      <> &middot; Expires: {new Date(a.contracts.expiration_date).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                {tab === "pending" && (
                  <button
                    onClick={() => setSigningId(a.id)}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
                  >
                    Sign Now
                  </button>
                )}
                {tab === "active" && (
                  <button
                    disabled
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed"
                  >
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sign Modal */}
      {signingId && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">
              {(selectedAssignment as any).contracts?.title}
            </h2>
            <div className="prose prose-invert prose-sm max-w-none mb-6 whitespace-pre-wrap text-zinc-300">
              {(selectedAssignment as any).contracts?.body_markdown}
            </div>
            <div className="border-t border-white/10 pt-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Type your full legal name to sign
              </label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSign}
                  disabled={!signatureName.trim() || submitting}
                  className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Signing..." : "Sign Contract"}
                </button>
                <button
                  onClick={() => {
                    setSigningId(null)
                    setSignatureName("")
                  }}
                  className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
