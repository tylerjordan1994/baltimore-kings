-- CMS follow-up DDL applied via MCP after Phase A.

-- Players can view published plays (additive to existing coach policies).
drop policy if exists tactics_member_read_published on tactics_boards;
create policy tactics_member_read_published on tactics_boards
  for select to authenticated
  using (is_published and public.is_member());

-- nav_items.parent_id re-parenting is exercised by the navigation editor;
-- nav tree + primary/footer items are seeded as data (see app seed / admin).
