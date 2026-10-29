-- MapleRoute Phase 1: accounts and CRS snapshots
-- Run this in Supabase Dashboard > SQL Editor > New query.

-- One profile row per authenticated user.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create the profile automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Every CRS check is kept so the applicant can see how their score changes.
create table if not exists public.crs_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  score integer not null check (score between 0 and 1200),
  breakdown jsonb not null,
  inputs jsonb not null,
  rules_version text not null,
  created_at timestamptz not null default now()
);

create index if not exists crs_snapshots_user_created_idx
  on public.crs_snapshots (user_id, created_at desc);

alter table public.crs_snapshots enable row level security;

drop policy if exists "crs_snapshots_select_own" on public.crs_snapshots;
drop policy if exists "crs_snapshots_insert_own" on public.crs_snapshots;
drop policy if exists "crs_snapshots_delete_own" on public.crs_snapshots;

create policy "crs_snapshots_select_own"
  on public.crs_snapshots for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "crs_snapshots_insert_own"
  on public.crs_snapshots for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "crs_snapshots_delete_own"
  on public.crs_snapshots for delete
  to authenticated
  using ((select auth.uid()) = user_id);
