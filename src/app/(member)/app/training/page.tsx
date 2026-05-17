"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { TrainingAssignment, TrainingProgress, TrainingPriority, TrainingStatus } from "@/types/database"

export default function TrainingPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [progress, setProgress] = useState<Record<string, TrainingProgress>>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
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
    const priorityOrder: Record<TrainingPriority, number> = { high: 0, normal: 1, low: 2 }
    unique.sort((a, b) => (priorityOrder[a.priority as TrainingPriority] || 1) - (priorityOrder[b.priority as TrainingPriority] || 1))
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
      prog?.forEach((p: any) => { progMap[p.assignment_id] = p })
      setProgress(progMap)
    }

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
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    normal: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  }

  const categoryColors: Record<string, string> = {
    technical: "bg-purple-500/20 text-purple-400",
    tactical: "bg-blue-500/20 text-blue-400",
    physical: "bg-green-500/20 text-green-400",
    mental: "bg-amber-500/20 text-amber-400",
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Training</h1>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : assignments.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-zinc-500">No training assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const prog = progress[a.id]
            const status = prog?.status || "not_started"
            return (
              <div
                key={a.id}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-white">
                        {a.focus_areas?.name}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${categoryColors[a.focus_areas?.category] || ""}`}>
                        {a.focus_areas?.category}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${priorityColors[a.priority]}`}>
                        {a.priority}
                      </span>
                    </div>
                    {a.notes_markdown && (
                      <p className="mt-2 text-sm text-zinc-400">{a.notes_markdown}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                      {a.due_by && <span>Due: {new Date(a.due_by).toLocaleDateString()}</span>}
                      <span>Status: {status.replace(/_/g, " ")}</span>
                    </div>
                    {a.attached_youtube_url && (
                      <a
                        href={a.attached_youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-amber-400 hover:text-amber-300"
                      >
                        Watch Video &rarr;
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {status === "not_started" && (
                      <button
                        onClick={() => updateStatus(a.id, "in_progress")}
                        className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/30 transition-colors"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {(status === "not_started" || status === "in_progress") && (
                      <button
                        onClick={() => updateStatus(a.id, "player_marked_complete")}
                        className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                    {status === "player_marked_complete" && (
                      <span className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400">
                        Awaiting Confirmation
                      </span>
                    )}
                    {status === "coach_confirmed" && (
                      <span className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400">
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
    </div>
  )
}
