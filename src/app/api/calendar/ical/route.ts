import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('visibility', 'public')
    .order('starts_at', { ascending: true })

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Baltimore Kings//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Baltimore Kings Schedule',
  ]

  for (const event of events || []) {
    const start = new Date(event.starts_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const end = event.ends_at
      ? new Date(event.ends_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : start

    lines.push(
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcal(event.title)}`,
      ...(event.location ? [`LOCATION:${escapeIcal(event.location)}`] : []),
      ...(event.description ? [`DESCRIPTION:${escapeIcal(event.description)}`] : []),
      `UID:${event.id}@baltimorekings.com`,
      'END:VEVENT'
    )
  }

  lines.push('END:VCALENDAR')

  return new NextResponse(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="baltimore-kings.ics"',
    },
  })
}

function escapeIcal(str: string): string {
  return str.replace(/[\\;,\n]/g, (match) => {
    if (match === '\n') return '\\n'
    return '\\' + match
  })
}
