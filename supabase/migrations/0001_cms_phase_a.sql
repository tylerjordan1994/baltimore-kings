-- CMS / Content-Token layer — Phase A schema.
-- Applied to project euscbkgirfebkabfgbow via MCP as five migrations:
--   cms_phase_a_1_enums_helpers_slug, _2_tables, _3_rls_view, _4_seed, _5_security_hardening
-- This consolidated file is the version-controlled record (idempotent, reflects final state).

-- ============================================================
-- 1. Enums + role helpers + profiles.slug
-- ============================================================
do $$ begin
  if not exists (select 1 from pg_type where typname='page_status') then create type page_status as enum ('draft','published'); end if;
  if not exists (select 1 from pg_type where typname='cms_visibility') then create type cms_visibility as enum ('public','members_only'); end if;
  if not exists (select 1 from pg_type where typname='nav_link_type') then create type nav_link_type as enum ('page','url','group'); end if;
  if not exists (select 1 from pg_type where typname='token_collection') then create type token_collection as enum ('players','events','sponsors','achievements','media','social','merch','learn','teams','value'); end if;
  if not exists (select 1 from pg_type where typname='token_mode') then create type token_mode as enum ('dynamic','curated','value'); end if;
  if not exists (select 1 from pg_type where typname='eval_visibility') then create type eval_visibility as enum ('coach_only','shared'); end if;
  if not exists (select 1 from pg_type where typname='fee_applies_to') then create type fee_applies_to as enum ('team','players'); end if;
  if not exists (select 1 from pg_type where typname='fee_assignment_status') then create type fee_assignment_status as enum ('outstanding','paid','waived'); end if;
end $$;

create or replace function public.is_coach_or_admin() returns boolean
  language sql stable security definer set search_path = public, pg_catalog as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('coach','superadmin'));
$$;
create or replace function public.is_member() returns boolean
  language sql stable security definer set search_path = public, pg_catalog as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('player','coach','superadmin'));
$$;
revoke execute on function public.is_coach_or_admin() from anon, public;
revoke execute on function public.is_member() from anon, public;
grant execute on function public.is_coach_or_admin() to authenticated;
grant execute on function public.is_member() to authenticated;

alter table profiles add column if not exists slug text;
create or replace function public.slugify(v text) returns text
  language sql immutable set search_path = public, pg_catalog as $$
  select trim(both '-' from regexp_replace(lower(coalesce(v,'')), '[^a-z0-9]+', '-', 'g'));
$$;
create or replace function public.set_profile_slug() returns trigger
  language plpgsql set search_path = public, pg_catalog as $$
declare base text; cand text; n int := 1;
begin
  if new.slug is null or new.slug = '' then
    base := nullif(public.slugify(new.full_name), '');
    if base is null then base := 'player'; end if;
    cand := base;
    while exists (select 1 from profiles where slug = cand and id <> new.id) loop
      n := n + 1; cand := base || '-' || n;
    end loop;
    new.slug := cand;
  end if;
  return new;
end $$;
drop trigger if exists trg_set_profile_slug on profiles;
create trigger trg_set_profile_slug before insert or update of full_name, slug on profiles
  for each row execute function public.set_profile_slug();
create unique index if not exists profiles_slug_key on profiles(slug) where slug is not null;

-- ============================================================
-- 2. Tables
-- ============================================================
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  puck_data jsonb not null default '{"content":[],"root":{}}'::jsonb,
  status page_status not null default 'draft',
  visibility cms_visibility not null default 'public',
  is_home boolean not null default false,
  seo_title text, seo_description text, og_image_url text,
  published_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  updated_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pages_slug_format check (slug ~ '^[a-z0-9]+(?:[-/][a-z0-9]+)*$'),
  constraint pages_slug_not_reserved check (slug !~ '^(app|api|auth|sign-in|sign-up|editor)(/|$)')
);
create unique index if not exists pages_single_home on pages(is_home) where is_home;

create table if not exists page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  puck_data jsonb not null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists page_revisions_page_idx on page_revisions(page_id, created_at desc);

create table if not exists nav_items (
  id uuid primary key default gen_random_uuid(),
  menu_key text not null check (menu_key in ('primary','footer') or menu_key like 'mega_%'),
  parent_id uuid references nav_items(id) on delete cascade,
  label text not null,
  link_type nav_link_type not null default 'page',
  page_id uuid references pages(id) on delete set null,
  external_url text, feature_card_json jsonb,
  is_cta boolean not null default false,
  visibility cms_visibility not null default 'public',
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists nav_items_menu_idx on nav_items(menu_key, order_index);

create table if not exists content_tokens (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null, description text,
  collection token_collection not null,
  mode token_mode not null,
  config jsonb not null default '{}'::jsonb,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id boolean primary key default true check (id),
  founded_year integer, contact_email text, contact_phone text, default_og_image_url text,
  public_theme text not null default 'light',
  dashboard_theme text not null default 'dark',
  social_handles jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists eval_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text,
  criteria jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists player_evaluations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  template_id uuid references eval_templates(id) on delete set null,
  team_id uuid references teams(id) on delete set null,
  season text,
  evaluator_id uuid references profiles(id) on delete set null,
  scores jsonb not null default '{}'::jsonb,
  summary_note text,
  visibility eval_visibility not null default 'coach_only',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists player_evaluations_profile_idx on player_evaluations(profile_id);

-- fee_items already existed (legacy direct-assignment model); extend to spec template model
alter table fee_items
  add column if not exists title text,
  add column if not exists currency text not null default 'usd',
  add column if not exists applies_to fee_applies_to not null default 'players',
  add column if not exists is_active boolean not null default true;

create table if not exists fee_assignments (
  id uuid primary key default gen_random_uuid(),
  fee_item_id uuid not null references fee_items(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  status fee_assignment_status not null default 'outstanding',
  payment_id uuid references payments(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fee_item_id, profile_id)
);
create index if not exists fee_assignments_profile_idx on fee_assignments(profile_id);

-- ============================================================
-- 3. RLS + policies + public_profiles view
-- ============================================================
alter table pages enable row level security;
alter table page_revisions enable row level security;
alter table nav_items enable row level security;
alter table content_tokens enable row level security;
alter table site_settings enable row level security;
alter table eval_templates enable row level security;
alter table player_evaluations enable row level security;
alter table fee_assignments enable row level security;

drop policy if exists pages_public_read on pages;
create policy pages_public_read on pages for select using (status='published' and visibility='public');
drop policy if exists pages_member_read on pages;
create policy pages_member_read on pages for select to authenticated using (public.is_member() and status='published');
drop policy if exists pages_admin_all on pages;
create policy pages_admin_all on pages for all to authenticated using (public.is_coach_or_admin()) with check (public.is_coach_or_admin());

drop policy if exists page_revisions_admin on page_revisions;
create policy page_revisions_admin on page_revisions for all to authenticated using (public.is_coach_or_admin()) with check (public.is_coach_or_admin());

drop policy if exists nav_public_read on nav_items;
create policy nav_public_read on nav_items for select using (is_active and visibility='public');
drop policy if exists nav_member_read on nav_items;
create policy nav_member_read on nav_items for select to authenticated using (public.is_member() and is_active);
drop policy if exists nav_admin_all on nav_items;
create policy nav_admin_all on nav_items for all to authenticated using (public.is_coach_or_admin()) with check (public.is_coach_or_admin());

drop policy if exists tokens_public_read on content_tokens;
create policy tokens_public_read on content_tokens for select using (true);
drop policy if exists tokens_admin_write on content_tokens;
create policy tokens_admin_write on content_tokens for all to authenticated using (public.is_coach_or_admin()) with check (public.is_coach_or_admin());

drop policy if exists settings_public_read on site_settings;
create policy settings_public_read on site_settings for select using (true);
drop policy if exists settings_admin_write on site_settings;
create policy settings_admin_write on site_settings for all to authenticated using (public.is_coach_or_admin()) with check (public.is_coach_or_admin());

drop policy if exists eval_templates_admin on eval_templates;
create policy eval_templates_admin on eval_templates for all to authenticated using (public.is_coach_or_admin()) with check (public.is_coach_or_admin());

drop policy if exists pe_player_read on player_evaluations;
create policy pe_player_read on player_evaluations for select to authenticated using (profile_id = auth.uid() and visibility='shared');
drop policy if exists pe_admin_all on player_evaluations;
create policy pe_admin_all on player_evaluations for all to authenticated using (public.is_coach_or_admin()) with check (public.is_coach_or_admin());

drop policy if exists fee_items_admin_cms on fee_items;
create policy fee_items_admin_cms on fee_items for all to authenticated using (public.is_coach_or_admin()) with check (public.is_coach_or_admin());
drop policy if exists fee_items_player_read on fee_items;
create policy fee_items_player_read on fee_items for select to authenticated using (
  exists (select 1 from fee_assignments fa where fa.fee_item_id = fee_items.id and fa.profile_id = auth.uid())
);

drop policy if exists fa_player_read on fee_assignments;
create policy fa_player_read on fee_assignments for select to authenticated using (profile_id = auth.uid());
drop policy if exists fa_admin_all on fee_assignments;
create policy fa_admin_all on fee_assignments for all to authenticated using (public.is_coach_or_admin()) with check (public.is_coach_or_admin());

-- Security-definer view: anon never touches `profiles` directly. Row + column
-- projection guarantees only approved public players, minors' bio nulled, and
-- school/hometown/dob/phone never selected. (Intentional; see SECURITY-REPORT.md.)
drop view if exists public_profiles;
create view public_profiles as
select
  p.id, p.slug, p.full_name, p.nickname, p.photo_url,
  p.position_primary, p.position_secondary, p.jersey_number,
  case when p.is_minor then null else p.bio end as bio,
  p.also_plays_for_steaks,
  coalesce((
    select jsonb_agg(jsonb_build_object('name', t.name, 'slug', t.slug) order by t.display_order)
    from team_members tm join teams t on t.id = tm.team_id
    where tm.profile_id = p.id and tm.is_active and t.is_active
  ), '[]'::jsonb) as teams
from profiles p
where p.approved_at is not null
  and p.status in ('active','injured')
  and (p.role = 'player' or (p.role in ('coach','superadmin') and p.also_plays));
revoke all on public_profiles from anon, authenticated;
grant select on public_profiles to anon, authenticated;
