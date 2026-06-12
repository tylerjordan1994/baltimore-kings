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
    proposed: "bg-zinc-100 text-zinc-700 border-zinc-300",
    approved: "bg-blue-100 text-blue-700 border-blue-300",
    in_progress: "bg-amber-100 text-amber-800 border-amber-300",
    achieved: "bg-green-100 text-green-700 border-green-300",
    revised: "bg-purple-100 text-purple-700 border-purple-300",
    dropped: "bg-red-100 text-red-700 border-red-300",
  }

  function RatingStars({ value }: { value: number }) {
    return (
      <span className="text-accent-dark">
        {"★".repeat(value)}
        {"☆".repeat(5 - value)}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <h1 className="text-2xl font-bold text-ink">Goals &amp; Evaluations</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          {/* Goals Section */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-ink">My Goals</h2>
            {goals.length === 0 ? (
              <div className="rounded-xl border border-border bg-white shadow-sm p-6">
                <p className="text-sm text-muted-foreground">
                  No goals set for you yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-border bg-white shadow-sm p-5"
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
                            <span className="text-xs text-muted-foreground">
                              {g.season}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-ink">
                          {g.goal_text}
                        </p>
                        {g.coach_feedback && (
                          <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2">
                            <p className="mb-0.5 text-xs font-medium text-blue-700">
                              Coach Feedback
                            </p>
                            <p className="text-sm text-ink/80">
                              {g.coach_feedback}
                            </p>
                          </div>
                        )}
                      </div>
                      {g.status === "in_progress" && (
                        <button
                          onClick={() => updateStatus(g.id, "achieved")}
                          className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-200"
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
            <h2 className="text-lg font-semibold text-ink">
              My Evaluations
            </h2>
            {evaluations.length === 0 ? (
              <div className="rounded-xl border border-border bg-white shadow-sm p-6">
                <p className="text-sm text-muted-foreground">
                  No evaluations shared with you yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluations.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-border bg-white shadow-sm p-5"
                  >
                    <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {new Date(ev.evaluation_date).toLocaleDateString()}
                      </span>
                      {ev.period && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                          {ev.period}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Technical:</span>
                        <RatingStars value={ev.technical_rating || 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Tactical:</span>
                        <RatingStars value={ev.tactical_rating || 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Physical:</span>
                        <RatingStars value={ev.physical_rating || 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Mental:</span>
                        <RatingStars value={ev.mental_rating || 0} />
                      </div>
                    </div>
                    {ev.strengths && (
                      <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                        <p className="mb-1 text-xs font-medium text-green-700">
                          Strengths
                        </p>
                        <p className="text-sm text-ink/80">{ev.strengths}</p>
                      </div>
                    )}
                    {ev.areas_for_growth && (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="mb-1 text-xs font-medium text-amber-800">
                          Areas for Growth
                        </p>
                        <p className="text-sm text-ink/80">
                          {ev.areas_for_growth}
                        </p>
                      </div>
                    )}
                    {ev.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{ev.notes}</p>
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
