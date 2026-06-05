-- CMS Phase A seed (idempotent). Applied via MCP as cms_phase_a_4_seed.

-- Zero-SQL superadmin (Priority Zero #1)
insert into superadmin_allowlist (email)
select 'tylerjordan1994@gmail.com'
where not exists (select 1 from superadmin_allowlist where email='tylerjordan1994@gmail.com');

-- site_settings singleton (founded_year NEEDS CONFIRMATION; light public / dark dashboard)
insert into site_settings (id, founded_year, public_theme, dashboard_theme, social_handles, settings)
select true, null, 'light', 'dark', '{}'::jsonb, jsonb_build_object('founded_year_status','NEEDS CONFIRMATION')
where not exists (select 1 from site_settings where id = true);

-- Teams (slug-stable so tokens can reference by slug)
insert into teams (name, slug, league, season, field_type, is_active, display_order)
select * from (values
  ('Futsal Kings 1','futsal-kings-1','futsal_l1'::league_type,'2025-2026','futsal_rounded'::field_type,true,1),
  ('Kings 2','futsal-kings-2','futsal_l1'::league_type,'2025-2026','futsal_rounded'::field_type,true,2),
  ('MASL3','masl3','masl3'::league_type,'2025-2026','masl_rounded_extra_player'::field_type,true,3)
) as v(name,slug,league,season,field_type,is_active,display_order)
where not exists (select 1 from teams t where t.slug = v.slug);

-- Content tokens (config references teams by slug; resolver maps slug -> id)
insert into content_tokens (key, name, description, collection, mode, config)
select * from (values
  ('first-team-roster','First Team Roster','Active members of Futsal Kings 1','players'::token_collection,'dynamic'::token_mode,
    '{"teamSlug":"futsal-kings-1","includeRoles":["player","coach_also_plays"],"rosterStatus":"active","sort":"jersey_asc"}'::jsonb),
  ('second-team-roster','Second Team Roster','Active members of Kings 2','players','dynamic',
    '{"teamSlug":"futsal-kings-2","includeRoles":["player","coach_also_plays"],"rosterStatus":"active","sort":"jersey_asc"}'::jsonb),
  ('masl3-roster','MASL3 Roster','Active members of the MASL3 team','players','dynamic',
    '{"teamSlug":"masl3","includeRoles":["player","coach_also_plays"],"rosterStatus":"active","sort":"jersey_asc"}'::jsonb),
  ('upcoming-public-events','Upcoming Public Events','Public events, upcoming, soonest first','events','dynamic',
    '{"scope":"public","when":"upcoming","sort":"starts_at_asc","limit":10}'::jsonb),
  ('next-match','Next Match','The next upcoming public match','value','value','{"compute":"next_match"}'::jsonb),
  ('club-founded-year','Club Founded Year','Year the club was founded','value','value','{"settingKey":"founded_year"}'::jsonb),
  ('active-sponsors','Active Sponsors','All active sponsors by display order','sponsors','dynamic','{"activeOnly":true,"sort":"order_index_asc"}'::jsonb),
  ('featured-players','Featured Players','Hand-picked players (empty initially)','players','curated','{"ids":[]}'::jsonb)
) as v(key,name,description,collection,mode,config)
where not exists (select 1 from content_tokens ct where ct.key = v.key);
