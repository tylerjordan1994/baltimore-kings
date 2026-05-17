"use client"

import { useMemo, useState } from "react"
import type { CalendarEvent } from "@/types/database"

interface ScheduleCalendarProps {
  events: CalendarEvent[]
  /** Optional click handler — omit for read-only calendars. */
  onEventClick?: (event: CalendarEvent) => void
  /** Visual theme. "dark" for member/admin panels, "light" for the public site. */
  theme?: "dark" | "light"
}

const KIND_COLORS: Record<string, string> = {
  practice: "#3b82f6",
  home_game: "#22c55e",
  away_game: "#f59e0b",
  tryout: "#a855f7",
  meeting: "#64748b",
  other: "#71717a",
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function ymd(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function ScheduleCalendar({
  events,
  onEventClick,
  theme = "dark",
}: ScheduleCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const isDark = theme === "dark"

  // Group events by day key
  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const e of events) {
      const d = new Date(e.starts_at)
      const key = ymd(d)
      ;(map[key] ??= []).push(e)
    }
    return map
  }, [events])

  // Build the 6-week grid
  const weeks = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const start = new Date(firstOfMonth)
    start.setDate(start.getDate() - start.getDay())
    const grid: Date[][] = []
    const day = new Date(start)
    for (let w = 0; w < 6; w++) {
      const row: Date[] = []
      for (let i = 0; i < 7; i++) {
        row.push(new Date(day))
        day.setDate(day.getDate() + 1)
      }
      grid.push(row)
    }
    return grid
  }, [cursor])

  const todayKey = ymd(new Date())
  const monthLabel = cursor.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  })

  const surface = isDark
    ? "border-zinc-800 bg-zinc-900"
    : "border-border bg-white"
  const headText = isDark ? "text-white" : "text-ink"
  const subText = isDark ? "text-zinc-500" : "text-muted-foreground"
  const cellBorder = isDark ? "border-zinc-800" : "border-border"
  const navBtn = isDark
    ? "border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
    : "border-border bg-paper text-ink hover:bg-muted"

  function shiftMonth(delta: number) {
    setCursor(
      (c) => new Date(c.getFullYear(), c.getMonth() + delta, 1)
    )
  }

  return (
    <div className={`rounded-xl border ${surface} p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-base font-semibold ${headText}`}>{monthLabel}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => shiftMonth(-1)}
            className={`h-7 w-7 rounded border text-sm ${navBtn}`}
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            onClick={() =>
              setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
            }
            className={`h-7 rounded border px-2 text-xs ${navBtn}`}
          >
            Today
          </button>
          <button
            onClick={() => shiftMonth(1)}
            className={`h-7 w-7 rounded border text-sm ${navBtn}`}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-7 border-l border-t ${cellBorder}`}>
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className={`border-r border-b ${cellBorder} py-1.5 text-center text-[11px] font-medium uppercase ${subText}`}
          >
            {d}
          </div>
        ))}
        {weeks.flat().map((day) => {
          const key = ymd(day)
          const inMonth = day.getMonth() === cursor.getMonth()
          const dayEvents = eventsByDay[key] ?? []
          const isToday = key === todayKey
          return (
            <div
              key={key}
              className={`min-h-20 border-r border-b ${cellBorder} p-1 ${
                inMonth ? "" : "opacity-40"
              }`}
            >
              <div
                className={`mb-1 text-right text-[11px] ${
                  isToday
                    ? "font-bold text-amber-500"
                    : isDark
                      ? "text-zinc-400"
                      : "text-muted-foreground"
                }`}
              >
                {day.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onEventClick?.(e)}
                    disabled={!onEventClick}
                    className="block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium text-white"
                    style={{
                      backgroundColor: KIND_COLORS[e.kind] ?? KIND_COLORS.other,
                      cursor: onEventClick ? "pointer" : "default",
                    }}
                    title={`${e.title} — ${new Date(
                      e.starts_at
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}`}
                  >
                    {new Date(e.starts_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                    })}{" "}
                    {e.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <div className={`px-1 text-[10px] ${subText}`}>
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
