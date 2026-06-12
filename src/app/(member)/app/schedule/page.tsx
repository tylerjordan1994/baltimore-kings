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
  practice: "bg-blue-100 text-blue-700 border-blue-200",
  home_game: "bg-green-100 text-green-700 border-green-200",
  away_game: "bg-amber-100 text-amber-800 border-amber-200",
  tryout: "bg-purple-100 text-purple-700 border-purple-200",
  meeting: "bg-slate-100 text-slate-700 border-slate-200",
  other: "bg-zinc-100 text-zinc-700 border-zinc-200",
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
        <h1 className="text-2xl font-bold text-ink">Schedule</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-white shadow-sm p-1">
          <button
            onClick={() => setView("calendar")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "calendar"
                ? "bg-brand text-paper"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "list"
                ? "bg-brand text-paper"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading schedule...</p>
      ) : view === "calendar" ? (
        <ScheduleCalendar events={events} theme="light" />
      ) : (
        <div className="space-y-3">
          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-border bg-white shadow-sm p-6">
              <p className="text-sm text-muted-foreground">
                No upcoming events scheduled.
              </p>
            </div>
          ) : (
            upcoming.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-border bg-white shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-ink">{e.title}</h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${
                          KIND_COLORS[e.kind] ?? KIND_COLORS.other
                        }`}
                      >
                        {KIND_LABELS[e.kind] ?? e.kind}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
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
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {e.location}
                      </p>
                    )}
                    {e.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
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
