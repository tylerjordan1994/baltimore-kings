-- Event reminder signups for the public schedule.
-- Anyone can subscribe (INSERT) to be reminded about an event; the table is NOT
-- publicly readable (no SELECT policy). A future cron can read unreminded rows for
-- events in the next 24h and email via lib/resend.ts, then flip reminded = true.

create table if not exists public.event_reminders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  reminded boolean not null default false,
  unique (event_id, email)
);

create index if not exists event_reminders_event_id_idx on public.event_reminders (event_id);
create index if not exists event_reminders_unreminded_idx on public.event_reminders (reminded) where reminded = false;

alter table public.event_reminders enable row level security;

-- Anyone may subscribe.
drop policy if exists "event_reminders_insert_public" on public.event_reminders;
create policy "event_reminders_insert_public"
  on public.event_reminders
  for insert
  with check (true);

-- No SELECT policy on purpose: signups are not publicly readable. Server-side cron
-- uses the service-role key (bypasses RLS) to read rows for sending reminders.
