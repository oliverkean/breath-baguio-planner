create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where user_id = (select auth.uid())
$$;

grant execute on function public.current_user_role() to authenticated;

alter table public.user_roles enable row level security;
alter table public.attractions enable row level security;
alter table public.tourism_events enable row level security;
alter table public.advisories enable row level security;
alter table public.crowd_rules enable row level security;

grant select on public.attractions, public.tourism_events, public.advisories, public.crowd_rules to anon, authenticated;
grant insert, update, delete on public.attractions, public.tourism_events, public.advisories, public.crowd_rules to authenticated;
grant select on public.user_roles to authenticated;

drop policy if exists user_roles_select_self on public.user_roles;
create policy user_roles_select_self on public.user_roles
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_role()) = 'admin');

drop policy if exists user_roles_admin_manage on public.user_roles;
create policy user_roles_admin_manage on public.user_roles
  for all
  to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

drop policy if exists attractions_public_read on public.attractions;
create policy attractions_public_read on public.attractions
  for select
  to anon, authenticated
  using (true);

drop policy if exists attractions_admin_manage on public.attractions;
create policy attractions_admin_manage on public.attractions
  for all
  to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

drop policy if exists tourism_events_public_read on public.tourism_events;
create policy tourism_events_public_read on public.tourism_events
  for select
  to anon, authenticated
  using (true);

drop policy if exists tourism_events_admin_manage on public.tourism_events;
create policy tourism_events_admin_manage on public.tourism_events
  for all
  to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

drop policy if exists advisories_public_read on public.advisories;
create policy advisories_public_read on public.advisories
  for select
  to anon, authenticated
  using (true);

drop policy if exists advisories_admin_manage on public.advisories;
create policy advisories_admin_manage on public.advisories
  for all
  to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

drop policy if exists crowd_rules_public_read on public.crowd_rules;
create policy crowd_rules_public_read on public.crowd_rules
  for select
  to anon, authenticated
  using (true);

drop policy if exists crowd_rules_admin_manage on public.crowd_rules;
create policy crowd_rules_admin_manage on public.crowd_rules
  for all
  to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');
