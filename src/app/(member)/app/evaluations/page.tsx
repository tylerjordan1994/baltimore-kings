"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function PlayerEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("evaluations")
        .select("*")
        .eq("profile_id", user.id)
        .eq("is_shared_with_player", true)
        .order("evaluation_date", { ascending: false })

      setEvaluations(data || [])
      setLoading(false)
    }
    load()
  }, [])

  function RatingStars({ value }: { value: number }) {
    return (
      <span className="text-amber-400">
        {"★".repeat(value)}{"☆".repeat(5 - value)}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-white">My Evaluations</h1>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : evaluations.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-zinc-500">No evaluations shared with you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluations.map((ev) => (
            <div key={ev.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                <span>{new Date(ev.evaluation_date).toLocaleDateString()}</span>
                {ev.period && <span className="rounded-full bg-white/10 px-2 py-0.5">{ev.period}</span>}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Technical:</span>
                  <RatingStars value={ev.technical_rating || 0} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Tactical:</span>
                  <RatingStars value={ev.tactical_rating || 0} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Physical:</span>
                  <RatingStars value={ev.physical_rating || 0} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Mental:</span>
                  <RatingStars value={ev.mental_rating || 0} />
                </div>
              </div>
              {ev.strengths && (
                <div className="mt-3 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                  <p className="text-xs font-medium text-green-400 mb-1">Strengths</p>
                  <p className="text-sm text-zinc-300">{ev.strengths}</p>
                </div>
              )}
              {ev.areas_for_growth && (
                <div className="mt-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-xs font-medium text-amber-400 mb-1">Areas for Growth</p>
                  <p className="text-sm text-zinc-300">{ev.areas_for_growth}</p>
                </div>
              )}
              {ev.notes && <p className="mt-2 text-sm text-zinc-500">{ev.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
