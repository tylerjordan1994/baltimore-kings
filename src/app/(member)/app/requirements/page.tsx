"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Requirement } from "@/types/database"

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [signedVersions, setSignedVersions] = useState<Map<string, number>>(new Map())
  const [changeNotes, setChangeNotes] = useState<Map<string, string>>(new Map())
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

    const [reqRes, sigRes, verRes] = await Promise.all([
      supabase
        .from("requirements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("requirement_signatures")
        .select("requirement_id, version")
        .eq("profile_id", user.id),
      supabase.from("requirement_versions").select("requirement_id, version, change_note"),
    ])

    // Highest version this player has signed, per requirement.
    const signed = new Map<string, number>()
    for (const s of (sigRes.data ?? []) as { requirement_id: string; version: number | null }[]) {
      const v = s.version ?? 1
      if ((signed.get(s.requirement_id) ?? 0) < v) signed.set(s.requirement_id, v)
    }
    // Change note for each requirement's current version.
    const notes = new Map<string, string>()
    for (const r of (reqRes.data ?? []) as Requirement[]) {
      const match = ((verRes.data ?? []) as { requirement_id: string; version: number; change_note: string | null }[])
        .find((v) => v.requirement_id === r.id && v.version === (r.version ?? 1))
      if (match?.change_note) notes.set(r.id, match.change_note)
    }

    setRequirements(reqRes.data ?? [])
    setSignedVersions(signed)
    setChangeNotes(notes)
    setLoading(false)
  }

  async function handleSign(req: Requirement) {
    setSigning(req.id)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("requirement_signatures").insert({
      requirement_id: req.id,
      profile_id: user.id,
      signature_text: "I agree",
      version: req.version ?? 1,
    })
    if (!error) {
      setSignedVersions((prev) => new Map(prev).set(req.id, req.version ?? 1))
    }
    setSigning(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading requirements...</p>
      </div>
    )
  }

  const needsCount = requirements.filter((r) => (signedVersions.get(r.id) ?? 0) < (r.version ?? 1)).length

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-ink">Team Expectations</h1>
      <p className="text-sm text-muted-foreground">
        Please review and sign all active team expectations below. When an agreement is updated you&apos;ll be asked to sign the new version.
      </p>
      {needsCount > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-100 p-4 text-sm text-amber-800">
          You have <span className="font-semibold">{needsCount}</span> agreement{needsCount === 1 ? "" : "s"} that need{needsCount === 1 ? "s" : ""} your signature.
        </div>
      )}

      {requirements.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active requirements.</p>
      ) : (
        <div className="space-y-6">
          {requirements.map((req) => {
            const signedVer = signedVersions.get(req.id) ?? 0
            const curVer = req.version ?? 1
            const isSigned = signedVer >= curVer
            const isUpdate = signedVer > 0 && signedVer < curVer
            const note = changeNotes.get(req.id)
            return (
              <div
                key={req.id}
                className={`rounded-xl border p-6 ${
                  isSigned ? "border-green-300 bg-white shadow-sm" : isUpdate ? "border-amber-300 bg-white shadow-sm" : "border-border bg-white shadow-sm"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-ink">{req.title}</h2>
                  {isSigned ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Signed (v{curVer})</span>
                  ) : isUpdate ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Updated — re-sign needed</span>
                  ) : (
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">Needs signature</span>
                  )}
                </div>

                {!isSigned && isUpdate && note ? (
                  <div className="mb-4 rounded-lg border border-amber-300 bg-amber-100 p-3 text-sm text-amber-800">
                    <span className="font-semibold">What changed (v{curVer}):</span> {note}
                  </div>
                ) : null}

                <div className="prose prose-sm mb-4 max-w-none text-ink/80">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{req.body_markdown}</pre>
                </div>

                {!isSigned && (
                  <button
                    onClick={() => handleSign(req)}
                    disabled={signing === req.id}
                    className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {signing === req.id ? "Signing..." : isUpdate ? "Review & Re-sign (new version)" : "I Agree — Sign"}
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
