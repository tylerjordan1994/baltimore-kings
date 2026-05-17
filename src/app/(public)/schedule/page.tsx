import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"
import { SponsorStrip } from "@/components/sponsor-strip"

// basePath handled by next.config.ts

export const metadata = {
  title: "Schedule | Baltimore Kings",
  description: "Baltimore Kings game schedule and events calendar.",
}

type CalendarEvent = {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  location: string | null
  event_type: string | null
}

// Static fallback events
function getStaticEvents(): CalendarEvent[] {
  const now = new Date()

  // Next Tuesday
  const nextTuesday = new Date(now)
  nextTuesday.setDate(now.getDate() + ((2 - now.getDay() + 7) % 7 || 7))
  nextTuesday.setHours(20, 0, 0, 0)

  // Next Thursday
  const nextThursday = new Date(now)
  nextThursday.setDate(now.getDate() + ((4 - now.getDay() + 7) % 7 || 7))
  nextThursday.setHours(20, 0, 0, 0)

  // Next Saturday
  const nextSaturday = new Date(now)
  nextSaturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7))
  nextSaturday.setHours(19, 0, 0, 0)

  // Following Saturday
  const followingSaturday = new Date(nextSaturday)
  followingSaturday.setDate(nextSaturday.getDate() + 7)
  followingSaturday.setHours(18, 0, 0, 0)

  return [
    {
      id: "static-practice-tue",
      title: "Weekly Practice",
      description: "Open to all rostered players. Bring both indoor and futsal shoes.",
      start_time: nextTuesday.toISOString(),
      end_time: new Date(nextTuesday.getTime() + 90 * 60 * 1000).toISOString(),
      location: "Benfield Sports, 1031 Benfield Blvd, Millersville, MD 21108",
      event_type: "practice",
    },
    {
      id: "static-practice-thu",
      title: "Weekly Practice",
      description: "Open to all rostered players. Bring both indoor and futsal shoes.",
      start_time: nextThursday.toISOString(),
      end_time: new Date(nextThursday.getTime() + 90 * 60 * 1000).toISOString(),
      location: "Benfield Sports, 1031 Benfield Blvd, Millersville, MD 21108",
      event_type: "practice",
    },
    {
      id: "static-home-game",
      title: "Home Game vs Maryland Storm",
      description: "League match. Full kit required. Arrive 45 minutes early for warm-up.",
      start_time: nextSaturday.toISOString(),
      end_time: new Date(nextSaturday.getTime() + 120 * 60 * 1000).toISOString(),
      location: "GOALS Baltimore, 6159 Edmondson Ave, Catonsville, MD 21228",
      event_type: "game",
    },
    {
      id: "static-away-game",
      title: "Away Game @ DC Futsal",
      description: "Away match. Carpool details shared in group chat.",
      start_time: followingSaturday.toISOString(),
      end_time: new Date(followingSaturday.getTime() + 120 * 60 * 1000).toISOString(),
      location: "DC Futsal Arena, Washington, DC",
      event_type: "game",
    },
  ]
}

function groupByMonth(events: CalendarEvent[]) {
  const groups: Record<string, CalendarEvent[]> = {}
  for (const event of events) {
    const key = new Date(event.start_time).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
    if (!groups[key]) groups[key] = []
    groups[key].push(event)
  }
  return groups
}

export default async function SchedulePage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("is_public", true)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })

  const dbEvents = (events as CalendarEvent[]) || []
  const staticEvents = getStaticEvents()

  // Combine: DB events first, then static fallback
  const allEvents = [...dbEvents, ...staticEvents].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  const grouped = groupByMonth(allEvents)

  return (
    <>
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Schedule
              </h1>
              <p className="mt-2 text-muted-foreground">
                Games, training sessions, and events.
              </p>
            </div>
            <Link href={`/api/calendar/ical`}>
              <Button variant="outline" size="sm" className="border-border font-heading font-semibold text-ink hover:bg-paper rounded-full">
                <Download className="mr-1.5 h-3.5 w-3.5 text-accent" />
                iCal Export
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {Object.keys(grouped).length > 0 ? (
            <div className="space-y-10">
              {Object.entries(grouped).map(([month, monthEvents]) => (
                <div key={month}>
                  <h2 className="font-heading text-lg font-bold text-ink">{month}</h2>
                  <div className="mt-4 space-y-3">
                    {monthEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 rounded-xl border border-border bg-white p-4 transition-all hover:border-accent/30"
                      >
                        <div className="flex flex-col items-center rounded-lg bg-paper px-3 py-1.5 text-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            {new Date(event.start_time).toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                          <span className="font-heading text-lg font-bold text-ink">
                            {new Date(event.start_time).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-heading font-semibold text-ink">{event.title}</p>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>
                              {new Date(event.start_time).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                              {event.end_time && (
                                <>
                                  {" \u2013 "}
                                  {new Date(event.end_time).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </>
                              )}
                            </span>
                            {event.location && <span>{event.location}</span>}
                          </div>
                          {event.description && (
                            <p className="mt-1.5 text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                          {event.event_type && (
                            <span className="mt-2 inline-block rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {event.event_type}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-heading text-lg font-semibold text-ink">No upcoming events</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The schedule will be updated as events are confirmed.
              </p>
            </div>
          )}
        </div>
      </section>

      <SponsorStrip />
    </>
  )
}
