-- Dashboard redesign: nav item descriptions, per-user dashboard quick links,
-- and lightweight first-party page analytics.

-- Mega-menu items show a one-line description under the label.
alter table nav_items add column if not exists description text;

-- Per-user dashboard preferences (coach quick-link tiles, drag-ordered).
create table if not exists dashboard_prefs (
  profile_id uuid primary key references profiles(id) on delete cascade,
  quick_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table dashboard_prefs enable row level security;

drop policy if exists "dashboard_prefs_select_own" on dashboard_prefs;
create policy "dashboard_prefs_select_own" on dashboard_prefs
  for select using (auth.uid() = profile_id);

drop policy if exists "dashboard_prefs_insert_own" on dashboard_prefs;
create policy "dashboard_prefs_insert_own" on dashboard_prefs
  for insert with check (auth.uid() = profile_id);

drop policy if exists "dashboard_prefs_update_own" on dashboard_prefs;
create policy "dashboard_prefs_update_own" on dashboard_prefs
  for update using (auth.uid() = profile_id);

-- First-party analytics: page views and link/button clicks on the public site.
create table if not exists page_views (
  id bigint generated always as identity primary key,
  path text not null,
  event_type text not null default 'view' check (event_type in ('view','click')),
  target text,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx on page_views (created_at desc);
create index if not exists page_views_path_idx on page_views (path);

alter table page_views enable row level security;

-- Anyone (anon beacon) may record events; only coaches/admins may read them.
drop policy if exists "page_views_insert_any" on page_views;
create policy "page_views_insert_any" on page_views
  for insert with check (true);

drop policy if exists "page_views_select_admin" on page_views;
create policy "page_views_select_admin" on page_views
  for select using (is_coach_or_admin());
