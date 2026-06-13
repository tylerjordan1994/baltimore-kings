import { createClient } from "@/lib/supabase/server"
import { SponsorStrip } from "@/components/sponsor-strip"
import { ScheduleView, type ScheduleEvent, type ScheduleTeam } from "./schedule-view"

// basePath handled by next.config.ts

export const metadata = {
  title: "Schedule | Baltimore Kings",
  description: "Baltimore Kings game schedule and events calendar.",
}

export default async function SchedulePage() {
  const supabase = await createClient()

  // Public, upcoming events ordered by start time.
  const { data: eventsData } = await supabase
    .from("calendar_events")
    .select(
      "id, title, kind, starts_at, ends_at, location, team_ids, description, cta_url, cta_label"
    )
    .eq("visibility", "public")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })

  // Active teams, used for squad color-coding + the sport/squad filters.
  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name")

  const events = (eventsData ?? []) as ScheduleEvent[]
  const teams = (teamsData ?? []) as ScheduleTeam[]

  return (
    <>
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Schedule
            </h1>
            <p className="mt-2 text-muted-foreground">
              Games, training sessions, and events. Filter by squad, type, sport, or venue.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScheduleView events={events} teams={teams} />
        </div>
      </section>

      <SponsorStrip />
    </>
  )
}
