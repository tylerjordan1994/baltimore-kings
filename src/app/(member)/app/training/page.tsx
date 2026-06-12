"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  TrainingProgress,
  TrainingPriority,
  TrainingStatus,
  Tutorial,
} from "@/types/database"

export default function TrainingAndTutorialsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [progress, setProgress] = useState<Record<string, TrainingProgress>>({})
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState("")

  const supabase = createClient()

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    // Get user's team IDs
    const { data: memberships } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("profile_id", user.id)
    const teamIds = memberships?.map((m: any) => m.team_id) || []

    // Fetch assignments for user directly
    const { data: directAssignments } = await supabase
      .from("training_assignments")
      .select("*, focus_areas(*)")
      .eq("assigned_to_profile_id", user.id)

    // Fetch team assignments
    let teamAssignments: any[] = []
    if (teamIds.length > 0) {
      const { data: ta } = await supabase
        .from("training_assignments")
        .select("*, focus_areas(*)")
        .in("assigned_to_team_id", teamIds)
      teamAssignments = ta || []
    }

    // Combine and dedupe
    const allAssignments = [...(directAssignments || []), ...teamAssignments]
    const uniqueMap = new Map()
    allAssignments.forEach((a) => uniqueMap.set(a.id, a))
    const unique = Array.from(uniqueMap.values())

    // Sort by priority
    const priorityOrder: Record<TrainingPriority, number> = {
      high: 0,
      normal: 1,
      low: 2,
    }
    unique.sort(
      (a, b) =>
        (priorityOrder[a.priority as TrainingPriority] || 1) -
        (priorityOrder[b.priority as TrainingPriority] || 1)
    )
    setAssignments(unique)

    // Fetch progress
    const ids = unique.map((a) => a.id)
    if (ids.length > 0) {
      const { data: prog } = await supabase
        .from("training_progress")
        .select("*")
        .eq("profile_id", user.id)
        .in("assignment_id", ids)

      const progMap: Record<string, TrainingProgress> = {}
      prog?.forEach((p: any) => {
        progMap[p.assignment_id] = p
      })
      setProgress(progMap)
    }

    // Fetch tutorials
    const { data: tutorialData } = await supabase
      .from("tutorials")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
    setTutorials((tutorialData as Tutorial[]) || [])

    setLoading(false)
  }

  async function updateStatus(assignmentId: string, newStatus: TrainingStatus) {
    if (!userId) return

    const existing = progress[assignmentId]
    if (existing) {
      await supabase
        .from("training_progress")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await supabase.from("training_progress").insert({
        assignment_id: assignmentId,
        profile_id: userId,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
    }

    load()
  }

  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    normal: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-zinc-100 text-zinc-700 border-zinc-200",
  }

  const categoryColors: Record<string, string> = {
    technical: "bg-purple-100 text-purple-700",
    tactical: "bg-blue-100 text-blue-700",
    physical: "bg-green-100 text-green-700",
    mental: "bg-amber-100 text-amber-800",
  }

  const tutorialCategories = Array.from(
    new Set(tutorials.map((t) => t.category).filter(Boolean))
  ) as string[]

  const filteredTutorials = filterCategory
    ? tutorials.filter((t) => t.category === filterCategory)
    : tutorials

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <h1 className="text-2xl font-bold text-ink">Training &amp; Tutorials</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          {/* Training Section */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-ink">
              Training Assignments
            </h2>
            {assignments.length === 0 ? (
              <div className="rounded-xl border border-border bg-white shadow-sm p-6">
                <p className="text-sm text-muted-foreground">
                  No training assignments yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => {
                  const prog = progress[a.id]
                  const status = prog?.status || "not_started"
                  return (
                    <div
                      key={a.id}
                      className="rounded-xl border border-border bg-white shadow-sm p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-ink">
                              {a.focus_areas?.name}
                            </h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${categoryColors[a.focus_areas?.category] || ""}`}
                            >
                              {a.focus_areas?.category}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${priorityColors[a.priority]}`}
                            >
                              {a.priority}
                            </span>
                          </div>
                          {a.notes_markdown && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {a.notes_markdown}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {a.due_by && (
                              <span>
                                Due:{" "}
                                {new Date(a.due_by).toLocaleDateString()}
                              </span>
                            )}
                            <span>
                              Status: {status.replace(/_/g, " ")}
                            </span>
                          </div>
                          {a.attached_youtube_url && (
                            <a
                              href={a.attached_youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-xs text-accent-dark hover:text-accent"
                            >
                              Watch Video &rarr;
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {status === "not_started" && (
                            <button
                              onClick={() =>
                                updateStatus(a.id, "in_progress")
                              }
                              className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
                            >
                              Mark In Progress
                            </button>
                          )}
                          {(status === "not_started" ||
                            status === "in_progress") && (
                            <button
                              onClick={() =>
                                updateStatus(a.id, "player_marked_complete")
                              }
                              className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-200"
                            >
                              Mark Complete
                            </button>
                          )}
                          {status === "player_marked_complete" && (
                            <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
                              Awaiting Confirmation
                            </span>
                          )}
                          {status === "coach_confirmed" && (
                            <span className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">
                              Confirmed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Tutorials Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Tutorials</h2>
              {tutorialCategories.length > 0 && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-muted-foreground focus:border-accent-dark focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {tutorialCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {filteredTutorials.length === 0 ? (
              <div className="rounded-xl border border-border bg-white shadow-sm p-6">
                <p className="text-sm text-muted-foreground">
                  No tutorials available yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTutorials.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-border bg-white shadow-sm p-5"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-ink">
                        {t.title}
                      </h3>
                      {t.category && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                          {t.category}
                        </span>
                      )}
                    </div>
                    {t.body_markdown && (
                      <p className="mb-3 whitespace-pre-wrap text-sm text-ink/80">
                        {t.body_markdown}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {t.youtube_url && (
                        <a
                          href={t.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                        >
                          Watch on YouTube
                        </a>
                      )}
                      {t.external_url && (
                        <a
                          href={t.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
                        >
                          External Resource
                        </a>
                      )}
                    </div>
                    <p className="mt-3 text-[10px] text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
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
