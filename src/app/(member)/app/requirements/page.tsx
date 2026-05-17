"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Requirement } from "@/types/database"

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [signedIds, setSignedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const [reqRes, sigRes] = await Promise.all([
      supabase
        .from("requirements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("requirement_signatures")
        .select("requirement_id")
        .eq("profile_id", user.id),
    ])

    setRequirements(reqRes.data ?? [])
    setSignedIds(new Set(sigRes.data?.map((s) => s.requirement_id) ?? []))
    setLoading(false)
  }

  async function handleSign(requirementId: string) {
    setSigning(requirementId)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("requirement_signatures").insert({
      requirement_id: requirementId,
      profile_id: user.id,
      signature_text: "I agree",
    })

    if (!error) {
      setSignedIds((prev) => new Set([...prev, requirementId]))
    }
    setSigning(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">Loading requirements...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Requirements</h1>
      <p className="text-sm text-zinc-400">
        Please review and sign all active requirements below.
      </p>

      {requirements.length === 0 ? (
        <p className="text-sm text-zinc-500">No active requirements.</p>
      ) : (
        <div className="space-y-6">
          {requirements.map((req) => {
            const isSigned = signedIds.has(req.id)
            return (
              <div
                key={req.id}
                className={`rounded-xl border p-6 ${
                  isSigned
                    ? "border-green-500/30 bg-zinc-900"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {req.title}
                  </h2>
                  {isSigned && (
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                      Signed
                    </span>
                  )}
                </div>

                <div className="prose prose-invert prose-sm mb-4 max-w-none text-zinc-300">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {req.body_markdown}
                  </pre>
                </div>

                {!isSigned && (
                  <button
                    onClick={() => handleSign(req.id)}
                    disabled={signing === req.id}
                    className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {signing === req.id
                      ? "Signing..."
                      : "I Agree — Sign Requirement"}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
