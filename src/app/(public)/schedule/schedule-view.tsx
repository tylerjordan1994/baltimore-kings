"use client"

import { useMemo, useState } from "react"
import {
  Calendar,
  List,
  MapPin,
  Ticket,
  Bell,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types (serialized plain objects passed from the server component)
// ---------------------------------------------------------------------------

export type EventKind =
  | "practice"
  | "home_game"
  | "away_game"
  | "tryout"
  | "meeting"
  | "other"

export interface ScheduleEvent {
  id: string
  title: string
  kind: EventKind
  starts_at: string
  ends_at: string | null
  location: string | null
  team_ids: string[] | null
  description: string | null
  cta_url: string | null
  cta_label: string | null
}

export interface ScheduleTeam {
  id: string
  name: string
  slug: string
}

// Squad definitions keyed by slug. Colors + sport assigned per spec.
// We look squads up by slug (not hardcoded uuids) and resolve the actual team
// uuid -> squad via the teams prop.
const SQUADS: Record<
  string,
  { name: string; color: string; sport: "futsal" | "arena" }
> = {
  "futsal-kings-1": { name: "Futsal Kings 1", color: "#1B2A4A", sport: "futsal" },
  "futsal-kings-2": { name: "Futsal Kings 2", color: "#C9A94E", sport: "futsal" },
  "salisbury-steaks": { name: "Salisbury Steaks", color: "#B91C1C", sport: "arena" },
  "kings-masl3": { name: "Kings MASL3", color: "#047857", sport: "arena" },
}

const KIND_LABELS: Record<EventKind, string> = {
  practice: "Practice",
  home_game: "Home",
  away_game: "Away",
  tryout: "Tryout",
  meeting: "Meeting",
  other: "Event",
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const BASE_PATH = "/project/football-team"

// ---------------------------------------------------------------------------
// Date / calendar helpers
// ---------------------------------------------------------------------------

function icsDate(iso: string): string {
  // UTC basic format: YYYYMMDDTHHMMSSZ
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function escIcs(s: string): string {
  return (s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

function googleCalendarUrl(event: ScheduleEvent): string {
  const start = icsDate(event.starts_at)
  // Default to a 90-minute block if no end time is recorded.
  const end = event.ends_at
    ? icsDate(event.ends_at)
    : icsDate(new Date(new Date(event.starts_at).getTime() + 90 * 60 * 1000).toISOString())
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
  })
  if (event.description) params.set("details", event.description)
  if (event.location) params.set("location", event.location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function eventToIcs(event: ScheduleEvent): string {
  const start = icsDate(event.starts_at)
  const end = event.ends_at
    ? icsDate(event.ends_at)
    : icsDate(new Date(new Date(event.starts_at).getTime() + 90 * 60 * 1000).toISOString())
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baltimore Kings//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@baltimore-kings`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escIcs(event.title)}`,
  ]
  if (event.location) lines.push(`LOCATION:${escIcs(event.location)}`)
  if (event.description) lines.push(`DESCRIPTION:${escIcs(event.description)}`)
  lines.push("END:VEVENT", "END:VCALENDAR")
  return lines.join("\r\n")
}

function downloadIcs(event: ScheduleEvent) {
  const ics = eventToIcs(event)
  const href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
  const a = document.createElement("a")
  a.href = href
  a.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function monthKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long" })
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// League vs Tournament is DERIVED (no DB column): title/description containing
// "tournament", "cup", or "showcase" (case-insensitive) is treated as Tournament.
function isTournament(event: ScheduleEvent): boolean {
  const hay = `${event.title} ${event.description ?? ""}`.toLowerCase()
  return /\b(tournament|cup|showcase)\b/.test(hay)
}

// ---------------------------------------------------------------------------
// Squad resolution
// ---------------------------------------------------------------------------

type Squad = { slug: string; name: string; color: string; sport: "futsal" | "arena" }

function useSquadLookup(teams: ScheduleTeam[]) {
  return useMemo(() => {
    // teamId -> squad
    const byTeamId = new Map<string, Squad>()
    for (const t of teams) {
      const def = SQUADS[t.slug]
      if (def) byTeamId.set(t.id, { slug: t.slug, ...def })
    }
    return byTeamId
  }, [teams])
}

function squadsForEvent(event: ScheduleEvent, byTeamId: Map<string, Squad>): Squad[] {
  const out: Squad[] = []
  for (const id of event.team_ids ?? []) {
    const s = byTeamId.get(id)
    if (s && !out.some((o) => o.slug === s.slug)) out.push(s)
  }
  return out
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ViewMode = "list" | "calendar"
type LeagueFilter = "all" | "league" | "tournament"
type SportFilter = "all" | "futsal" | "arena"

interface ScheduleViewProps {
  events: ScheduleEvent[]
  teams: ScheduleTeam[]
}

export function ScheduleView({ events, teams }: ScheduleViewProps) {
  const byTeamId = useSquadLookup(teams)

  const [view, setView] = useState<ViewMode>("list")

  // Filters
  const [squadSlugs, setSquadSlugs] = useState<string[]>([]) // empty = all
  const [kinds, setKinds] = useState<EventKind[]>([]) // empty = all
  const [venue, setVenue] = useState<string>("") // "" = all
  const [sport, setSport] = useState<SportFilter>("all")
  const [leagueType, setLeagueType] = useState<LeagueFilter>("all")
  const [openTryouts, setOpenTryouts] = useState(false)

  // Distinct venues derived from events.
  const venues = useMemo(() => {
    const set = new Set<string>()
    for (const e of events) if (e.location) set.add(e.location)
    return Array.from(set).sort()
  }, [events])

  const availableSquads = useMemo(() => {
    // Only show squad chips that actually have a matching team.
    return Object.entries(SQUADS)
      .filter(([slug]) => teams.some((t) => t.slug === slug))
      .map(([slug, def]) => ({ slug, ...def }))
  }, [teams])

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const eSquads = squadsForEvent(e, byTeamId)

      if (squadSlugs.length > 0) {
        if (!eSquads.some((s) => squadSlugs.includes(s.slug))) return false
      }
      if (kinds.length > 0 && !kinds.includes(e.kind)) return false
      if (venue && e.location !== venue) return false
      if (sport !== "all") {
        if (!eSquads.some((s) => s.sport === sport)) return false
      }
      if (leagueType !== "all") {
        const t = isTournament(e)
        if (leagueType === "tournament" && !t) return false
        if (leagueType === "league" && t) return false
      }
      if (openTryouts && e.kind !== "tryout") return false
      return true
    })
  }, [events, byTeamId, squadSlugs, kinds, venue, sport, leagueType, openTryouts])

  const activeFilterCount =
    (squadSlugs.length > 0 ? 1 : 0) +
    (kinds.length > 0 ? 1 : 0) +
    (venue ? 1 : 0) +
    (sport !== "all" ? 1 : 0) +
    (leagueType !== "all" ? 1 : 0) +
    (openTryouts ? 1 : 0)

  function clearFilters() {
    setSquadSlugs([])
    setKinds([])
    setVenue("")
    setSport("all")
    setLeagueType("all")
    setOpenTryouts(false)
  }

  function toggleSquad(slug: string) {
    setSquadSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  function toggleKind(k: EventKind) {
    setKinds((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))
  }

  return (
    <div>
      {/* View switch + iCal export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-white p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              view === "list" ? "bg-brand text-paper" : "text-muted-foreground hover:text-ink"
            }`}
          >
            <List className="h-4 w-4" /> List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              view === "calendar" ? "bg-brand text-paper" : "text-muted-foreground hover:text-ink"
            }`}
          >
            <Calendar className="h-4 w-4" /> Calendar
          </button>
        </div>

        <a
          href={`${BASE_PATH}/api/calendar/ical`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-accent/30"
        >
          <Download className="h-3.5 w-3.5 text-accent" /> iCal Export
        </a>
      </div>

      {/* Filters */}
      <Filters
        availableSquads={availableSquads}
        squadSlugs={squadSlugs}
        toggleSquad={toggleSquad}
        kinds={kinds}
        toggleKind={toggleKind}
        venues={venues}
        venue={venue}
        setVenue={setVenue}
        sport={sport}
        setSport={setSport}
        leagueType={leagueType}
        setLeagueType={setLeagueType}
        openTryouts={openTryouts}
        setOpenTryouts={setOpenTryouts}
        activeFilterCount={activeFilterCount}
        clearFilters={clearFilters}
      />

      {/* Results */}
      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : view === "list" ? (
          <ListView events={filtered} byTeamId={byTeamId} />
        ) : (
          <CalendarView events={filtered} byTeamId={byTeamId} />
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

interface FiltersProps {
  availableSquads: Squad[]
  squadSlugs: string[]
  toggleSquad: (slug: string) => void
  kinds: EventKind[]
  toggleKind: (k: EventKind) => void
  venues: string[]
  venue: string
  setVenue: (v: string) => void
  sport: SportFilter
  setSport: (s: SportFilter) => void
  leagueType: LeagueFilter
  setLeagueType: (l: LeagueFilter) => void
  openTryouts: boolean
  setOpenTryouts: (b: boolean) => void
  activeFilterCount: number
  clearFilters: () => void
}

function Filters(props: FiltersProps) {
  const {
    availableSquads,
    squadSlugs,
    toggleSquad,
    kinds,
    toggleKind,
    venues,
    venue,
    setVenue,
    sport,
    setSport,
    leagueType,
    setLeagueType,
    openTryouts,
    setOpenTryouts,
    activeFilterCount,
    clearFilters,
  } = props

  const kindChips: EventKind[] = ["home_game", "away_game", "practice", "tryout"]

  return (
    <div className="mt-6 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <Filter className="h-4 w-4 text-accent" />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-paper">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-ink"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {/* Squad */}
        <FilterRow label="Squad">
          {availableSquads.map((s) => {
            const active = squadSlugs.includes(s.slug)
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => toggleSquad(s.slug)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active ? "text-paper" : "border-border bg-paper text-ink hover:border-accent/30"
                }`}
                style={active ? { backgroundColor: s.color, borderColor: s.color } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: active ? "#fff" : s.color }}
                />
                {s.name}
              </button>
            )
          })}
        </FilterRow>

        {/* Game type / kind */}
        <FilterRow label="Type">
          {kindChips.map((k) => (
            <Chip key={k} active={kinds.includes(k)} onClick={() => toggleKind(k)}>
              {KIND_LABELS[k]}
            </Chip>
          ))}
        </FilterRow>

        {/* Sport */}
        <FilterRow label="Sport">
          <Chip active={sport === "all"} onClick={() => setSport("all")}>
            All
          </Chip>
          <Chip active={sport === "futsal"} onClick={() => setSport("futsal")}>
            Futsal
          </Chip>
          <Chip active={sport === "arena"} onClick={() => setSport("arena")}>
            Arena
          </Chip>
        </FilterRow>

        {/* League vs Tournament (derived) */}
        <FilterRow label="Competition">
          <Chip active={leagueType === "all"} onClick={() => setLeagueType("all")}>
            All
          </Chip>
          <Chip active={leagueType === "league"} onClick={() => setLeagueType("league")}>
            League
          </Chip>
          <Chip
            active={leagueType === "tournament"}
            onClick={() => setLeagueType("tournament")}
          >
            Tournament
          </Chip>
        </FilterRow>

        {/* Venue + quick filters */}
        <FilterRow label="Venue">
          <select
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="rounded-full border border-border bg-paper px-3 py-1 text-xs font-medium text-ink focus:border-accent focus:outline-none"
          >
            <option value="">All venues</option>
            {venues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <Chip active={openTryouts} onClick={() => setOpenTryouts(!openTryouts)}>
            Open tryouts only
          </Chip>
        </FilterRow>
      </div>
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-paper"
          : "border-border bg-paper text-ink hover:border-accent/30"
      }`}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

function ListView({
  events,
  byTeamId,
}: {
  events: ScheduleEvent[]
  byTeamId: Map<string, Squad>
}) {
  const grouped = useMemo(() => {
    const groups: Record<string, ScheduleEvent[]> = {}
    for (const e of events) {
      const key = monthKey(e.starts_at)
      ;(groups[key] ??= []).push(e)
    }
    return groups
  }, [events])

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([month, monthEvents]) => (
        <div key={month}>
          <h2 className="font-heading text-lg font-bold text-ink">{month}</h2>
          <div className="mt-4 space-y-3">
            {monthEvents.map((event) => (
              <EventRow key={event.id} event={event} squads={squadsForEvent(event, byTeamId)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EventRow({ event, squads }: { event: ScheduleEvent; squads: Squad[] }) {
  const accent = squads[0]?.color ?? "#C9A94E"
  return (
    <div
      id={`event-${event.id}`}
      className="flex items-start gap-4 rounded-xl border border-border border-l-4 bg-white p-4 transition-all hover:border-accent/30"
      style={{ borderLeftColor: accent }}
    >
      <div className="flex flex-col items-center rounded-lg bg-paper px-3 py-1.5 text-center">
        <span className="text-xs font-medium text-muted-foreground">
          {new Date(event.starts_at).toLocaleDateString("en-US", { weekday: "short" })}
        </span>
        <span className="font-heading text-lg font-bold text-ink">
          {new Date(event.starts_at).getDate()}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading font-semibold text-ink">{event.title}</p>
          <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {KIND_LABELS[event.kind]}
          </span>
          {isTournament(event) && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-dark">
              Tournament
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            {fmtTime(event.starts_at)}
            {event.ends_at && <>{" – "}{fmtTime(event.ends_at)}</>}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {event.location}
            </span>
          )}
        </div>

        {/* Squad chips */}
        {squads.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {squads.map((s) => (
              <span
                key={s.slug}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: s.color }}
              >
                {s.name}
              </span>
            ))}
          </div>
        )}

        {event.description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{event.description}</p>
        )}

        <EventActions event={event} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Per-event actions
// ---------------------------------------------------------------------------

function EventActions({ event }: { event: ScheduleEvent }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {event.cta_url && (
        <a
          href={event.cta_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-paper transition-opacity hover:opacity-90"
        >
          <Ticket className="h-3.5 w-3.5" /> {event.cta_label || "Buy tickets"}
        </a>
      )}
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent/30"
      >
        <Calendar className="h-3.5 w-3.5 text-accent" /> Google Calendar
      </a>
      <button
        type="button"
        onClick={() => downloadIcs(event)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent/30"
      >
        <Download className="h-3.5 w-3.5 text-accent" /> iCal
      </button>
      <RemindMe eventId={event.id} />
    </div>
  )
}

function RemindMe({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    try {
      const res = await fetch(`${BASE_PATH}/api/schedule/reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, email: email.trim() }),
      })
      if (res.ok) {
        setStatus("success")
        setEmail("")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent/30"
      >
        <Bell className="h-3.5 w-3.5 text-accent" /> Remind me
      </button>
    )
  }

  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent-dark">
        <Bell className="h-3.5 w-3.5" /> We&apos;ll remind you.
      </span>
    )
  }

  return (
    <form onSubmit={submit} className="inline-flex items-center gap-1.5">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="w-44 rounded-full border border-border bg-white px-3 py-1.5 text-xs text-ink placeholder:text-muted-foreground focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-paper disabled:opacity-50"
      >
        {status === "loading" ? "..." : "Notify"}
      </button>
      {status === "error" && <span className="text-xs text-destructive">Try again</span>}
    </form>
  )
}

// ---------------------------------------------------------------------------
// Calendar view
// ---------------------------------------------------------------------------

function CalendarView({
  events,
  byTeamId,
}: {
  events: ScheduleEvent[]
  byTeamId: Map<string, Squad>
}) {
  const [cursor, setCursor] = useState(() => {
    // Start on the month of the earliest filtered event, else current month.
    const first = events[0] ? new Date(events[0].starts_at) : new Date()
    return new Date(first.getFullYear(), first.getMonth(), 1)
  })
  const [selected, setSelected] = useState<ScheduleEvent | null>(null)

  const eventsByDay = useMemo(() => {
    const map: Record<string, ScheduleEvent[]> = {}
    for (const e of events) {
      const key = dayKey(new Date(e.starts_at))
      ;(map[key] ??= []).push(e)
    }
    return map
  }, [events])

  const weeks = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay() // Sunday start
    const gridStart = new Date(year, month, 1 - startOffset)
    const result: Date[][] = []
    const d = new Date(gridStart)
    for (let w = 0; w < 6; w++) {
      const week: Date[] = []
      for (let i = 0; i < 7; i++) {
        week.push(new Date(d))
        d.setDate(d.getDate() + 1)
      }
      result.push(week)
    }
    return result
  }, [cursor])

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-ink">{monthLabel}</h2>
        <div className="inline-flex gap-1">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink hover:border-accent/30"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink hover:border-accent/30"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="pb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {w}
          </div>
        ))}

        {weeks.flat().map((d) => {
          const inMonth = d.getMonth() === cursor.getMonth()
          const dayEvents = eventsByDay[dayKey(d)] ?? []
          const isToday = dayKey(d) === dayKey(new Date())
          return (
            <div
              key={d.toISOString()}
              className={`min-h-[84px] rounded-lg border p-1.5 text-left align-top ${
                inMonth ? "border-border bg-white" : "border-transparent bg-paper/50"
              }`}
            >
              <div
                className={`text-xs font-semibold ${
                  isToday
                    ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-paper"
                    : inMonth
                      ? "text-ink"
                      : "text-muted-foreground"
                }`}
              >
                {d.getDate()}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((e) => {
                  const sq = squadsForEvent(e, byTeamId)
                  const color = sq[0]?.color ?? "#C9A94E"
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelected(e)}
                      className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] font-medium text-ink hover:bg-paper"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate">{e.title}</span>
                    </button>
                  )
                })}
                {dayEvents.length > 3 && (
                  <span className="px-1 text-[10px] text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <EventPopover
          event={selected}
          squads={squadsForEvent(selected, byTeamId)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function EventPopover({
  event,
  squads,
  onClose,
}: {
  event: ScheduleEvent
  squads: Squad[]
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-bold text-ink">{event.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(event.starts_at).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}{" "}
          · {fmtTime(event.starts_at)}
          {event.ends_at && <>{" – "}{fmtTime(event.ends_at)}</>}
        </p>

        {event.location && (
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {event.location}
          </p>
        )}

        {squads.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {squads.map((s) => (
              <span
                key={s.slug}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: s.color }}
              >
                {s.name}
              </span>
            ))}
          </div>
        )}

        {event.description && (
          <p className="mt-3 text-sm text-muted-foreground">{event.description}</p>
        )}

        <EventActions event={event} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center">
      <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-3 font-heading text-lg font-semibold text-ink">No events match your filters</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Try clearing filters or check back as events are confirmed.
      </p>
    </div>
  )
}
