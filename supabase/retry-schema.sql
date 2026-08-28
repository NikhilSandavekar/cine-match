-- Cine-Match safe retry: run this if schema.sql reports an existing policy.
-- It does not delete users, room history, likes, or watched records.

alter table public.profiles enable row level security;
alter table public.title_actions enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.room_swipes enable row level security;

drop policy if exists "profiles: own row" on public.profiles;
drop policy if exists "actions: own rows" on public.title_actions;
drop policy if exists "rooms: members can read" on public.rooms;
drop policy if exists "rooms: owner can create" on public.rooms;
drop policy if exists "members: room participants can read" on public.room_members;
drop policy if exists "members: join self" on public.room_members;
drop policy if exists "swipes: room participants can read" on public.room_swipes;
drop policy if exists "swipes: member writes own" on public.room_swipes;

create policy "profiles: own row" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy "actions: own rows" on public.title_actions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "rooms: members can read" on public.rooms
  for select using (exists (select 1 from public.room_members where room_id = rooms.id and user_id = auth.uid()));
create policy "rooms: owner can create" on public.rooms
  for insert with check (created_by = auth.uid());
create policy "members: room participants can read" on public.room_members
  for select using (exists (select 1 from public.room_members mine where mine.room_id = room_members.room_id and mine.user_id = auth.uid()));
create policy "members: join self" on public.room_members
  for insert with check (user_id = auth.uid());
create policy "swipes: room participants can read" on public.room_swipes
  for select using (exists (select 1 from public.room_members where room_id = room_swipes.room_id and user_id = auth.uid()));
create policy "swipes: member writes own" on public.room_swipes
  for insert with check (user_id = auth.uid() and exists (select 1 from public.room_members where room_id = room_swipes.room_id and user_id = auth.uid()));

create or replace function public.join_room_by_code(room_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare target_room uuid;
begin
  select id into target_room from public.rooms where code = upper(trim(room_code));
  if target_room is null then raise exception 'Room not found'; end if;
  insert into public.room_members (room_id, user_id) values (target_room, auth.uid()) on conflict do nothing;
  return target_room;
end;
$$;

revoke all on function public.join_room_by_code(text) from public;
grant execute on function public.join_room_by_code(text) to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_swipes') then
    alter publication supabase_realtime add table public.room_swipes;
  end if;
end;
$$;

