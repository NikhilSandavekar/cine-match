-- Cine-Match: run this file once in Supabase Dashboard > SQL Editor.
-- This schema records Cine-Match activity only. It never imports a user's
-- Facebook data or viewing history from Facebook.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'en' check (locale in ('en', 'hi')),
  created_at timestamptz not null default now()
);

create table if not exists public.title_actions (
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id text not null,
  action text not null check (action in ('liked', 'disliked', 'watched')),
  created_at timestamptz not null default now(),
  primary key (user_id, title_id)
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^CINE-[A-Z0-9]{4,8}$'),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists public.room_swipes (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id text not null,
  decision text not null check (decision in ('liked', 'disliked')),
  created_at timestamptz not null default now(),
  primary key (room_id, user_id, title_id)
);

alter table public.profiles enable row level security;
alter table public.title_actions enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.room_swipes enable row level security;

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

-- Safe room-code join without making the rooms table public.
create or replace function public.join_room_by_code(room_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare target_room uuid;
begin
  select id into target_room from public.rooms where code = upper(trim(room_code));
  if target_room is null then
    raise exception 'Room not found';
  end if;
  insert into public.room_members (room_id, user_id)
  values (target_room, auth.uid())
  on conflict do nothing;
  return target_room;
end;
$$;

revoke all on function public.join_room_by_code(text) from public;
grant execute on function public.join_room_by_code(text) to authenticated;

-- Enable this only once when you want real-time room swipes in the client.
alter publication supabase_realtime add table public.room_swipes;

