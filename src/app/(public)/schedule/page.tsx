import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"

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

  const grouped = groupByMonth((events as CalendarEvent[]) || [])

  return (
    <>
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Schedule
              </h1>
              <p className="mt-2 text-primary-foreground/70">
                Games, training sessions, and events.
              </p>
            </div>
            <Link href={`/api/calendar/ical`}>
              <Button variant="secondary" size="sm" className="font-heading font-semibold">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                iCal Export
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {Object.keys(grouped).length > 0 ? (
            <div className="space-y-10">
              {Object.entries(grouped).map(([month, monthEvents]) => (
                <div key={month}>
                  <h2 className="font-heading text-lg font-bold text-foreground">{month}</h2>
                  <div className="mt-4 space-y-3">
                    {monthEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 rounded-lg border border-border bg-card p-4"
                      >
                        <div className="flex flex-col items-center rounded bg-muted px-3 py-1.5 text-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            {new Date(event.start_time).toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                          <span className="font-heading text-lg font-bold">
                            {new Date(event.start_time).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-heading font-semibold">{event.title}</p>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>
                              {new Date(event.start_time).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                              {event.end_time && (
                                <>
                                  {" – "}
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
                            <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 font-heading text-lg font-semibold">No upcoming events</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The schedule will be updated as events are confirmed.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
