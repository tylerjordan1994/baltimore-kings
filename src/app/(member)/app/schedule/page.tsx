"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import type { CalendarEvent } from "@/types/database"

const KIND_LABELS: Record<string, string> = {
  practice: "Practice",
  home_game: "Home Game",
  away_game: "Away Game",
  tryout: "Tryout",
  meeting: "Meeting",
  other: "Event",
}

const KIND_COLORS: Record<string, string> = {
  practice: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  home_game: "bg-green-500/20 text-green-400 border-green-500/30",
  away_game: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  tryout: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  meeting: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
}

export default function PlayerSchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"calendar" | "list">("calendar")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .order("starts_at", { ascending: true })
      setEvents(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.starts_at) >= now)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Schedule</h1>
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          <button
            onClick={() => setView("calendar")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "calendar"
                ? "bg-amber-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "list"
                ? "bg-amber-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading schedule...</p>
      ) : view === "calendar" ? (
        <ScheduleCalendar events={events} theme="dark" />
      ) : (
        <div className="space-y-3">
          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-500">
                No upcoming events scheduled.
              </p>
            </div>
          ) : (
            upcoming.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-white">{e.title}</h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${
                          KIND_COLORS[e.kind] ?? KIND_COLORS.other
                        }`}
                      >
                        {KIND_LABELS[e.kind] ?? e.kind}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                      {new Date(e.starts_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {e.ends_at &&
                        ` – ${new Date(e.ends_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}`}
                    </p>
                    {e.location && (
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {e.location}
                      </p>
                    )}
                    {e.description && (
                      <p className="mt-2 text-sm text-zinc-400">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
