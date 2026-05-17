"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { PlayerGoal, GoalStatus } from "@/types/database"

export default function GoalsAndEvaluationsPage() {
  const [goals, setGoals] = useState<PlayerGoal[]>([])
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const [goalsRes, evalsRes] = await Promise.all([
      supabase
        .from("player_goals")
        .select("*")
        .eq("profile_id", user.id)
        .order("set_at", { ascending: false }),
      supabase
        .from("evaluations")
        .select("*")
        .eq("profile_id", user.id)
        .eq("is_shared_with_player", true)
        .order("evaluation_date", { ascending: false }),
    ])

    setGoals(goalsRes.data || [])
    setEvaluations(evalsRes.data || [])
    setLoading(false)
  }

  async function updateStatus(goalId: string, newStatus: GoalStatus) {
    await supabase
      .from("player_goals")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", goalId)
    load()
  }

  const statusColors: Record<GoalStatus, string> = {
    proposed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    achieved: "bg-green-500/20 text-green-400 border-green-500/30",
    revised: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    dropped: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  function RatingStars({ value }: { value: number }) {
    return (
      <span className="text-amber-400">
        {"★".repeat(value)}
        {"☆".repeat(5 - value)}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <h1 className="text-2xl font-bold text-white">Goals &amp; Evaluations</h1>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : (
        <>
          {/* Goals Section */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">My Goals</h2>
            {goals.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm text-zinc-500">
                  No goals set for you yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${statusColors[g.status]}`}
                          >
                            {g.status.replace(/_/g, " ")}
                          </span>
                          {g.season && (
                            <span className="text-xs text-zinc-500">
                              {g.season}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-white">
                          {g.goal_text}
                        </p>
                        {g.coach_feedback && (
                          <div className="mt-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                            <p className="mb-0.5 text-xs font-medium text-blue-400">
                              Coach Feedback
                            </p>
                            <p className="text-sm text-zinc-300">
                              {g.coach_feedback}
                            </p>
                          </div>
                        )}
                      </div>
                      {g.status === "in_progress" && (
                        <button
                          onClick={() => updateStatus(g.id, "achieved")}
                          className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/30"
                        >
                          Achieved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Evaluations Section */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">
              My Evaluations
            </h2>
            {evaluations.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm text-zinc-500">
                  No evaluations shared with you yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluations.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                  >
                    <div className="mb-3 flex items-center gap-3 text-xs text-zinc-400">
                      <span>
                        {new Date(ev.evaluation_date).toLocaleDateString()}
                      </span>
                      {ev.period && (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5">
                          {ev.period}
                        </span>
                      )}
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
                      <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                        <p className="mb-1 text-xs font-medium text-green-400">
                          Strengths
                        </p>
                        <p className="text-sm text-zinc-300">{ev.strengths}</p>
                      </div>
                    )}
                    {ev.areas_for_growth && (
                      <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                        <p className="mb-1 text-xs font-medium text-amber-400">
                          Areas for Growth
                        </p>
                        <p className="text-sm text-zinc-300">
                          {ev.areas_for_growth}
                        </p>
                      </div>
                    )}
                    {ev.notes && (
                      <p className="mt-2 text-sm text-zinc-500">{ev.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
