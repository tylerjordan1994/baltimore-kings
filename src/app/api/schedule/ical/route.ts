import { createAnonClient } from "@/lib/supabase/anon"

export const dynamic = "force-dynamic"

function icsDate(iso: string): string {
  // YYYYMMDDTHHMMSSZ (UTC)
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}
function esc(s: string): string {
  return (s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

/** Public schedule as an iCal feed (subscribe in any calendar app). Public events only. */
export async function GET() {
  const supabase = createAnonClient()
  const { data } = await supabase
    .from("calendar_events")
    .select("id, title, kind, starts_at, ends_at, location, description")
    .eq("visibility", "public")
    .order("starts_at", { ascending: true })

  type Ev = { id: string; title: string; kind: string; starts_at: string; ends_at: string | null; location: string | null; description: string | null }
  const events = (data ?? []) as Ev[]

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baltimore Kings//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Baltimore Kings",
  ]
  for (const e of events) {
    lines.push("BEGIN:VEVENT")
    lines.push(`UID:${e.id}@baltimore-kings`)
    lines.push(`DTSTART:${icsDate(e.starts_at)}`)
    if (e.ends_at) lines.push(`DTEND:${icsDate(e.ends_at)}`)
    lines.push(`SUMMARY:${esc(e.title)}`)
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`)
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`)
    lines.push("END:VEVENT")
  }
  lines.push("END:VCALENDAR")

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="baltimore-kings.ics"',
    },
  })
}
