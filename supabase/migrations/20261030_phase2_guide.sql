-- MapleRoute Phase 2: guided walkthroughs (Express Entry profile)
-- Run in Supabase Dashboard > SQL Editor after 20261029_phase1_auth_crs.sql.

-- Admin flag on the existing profile row.
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  version text not null default '0.1.0',
  status text not null default 'draft' check (status in ('draft', 'ready')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guide_sections (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guides (id) on delete cascade,
  position integer not null,
  title text not null,
  summary text,
  estimated_minutes integer,
  estimated_cost_text text,
  unique (guide_id, position)
);

create table if not exists public.guide_steps (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.guide_sections (id) on delete cascade,
  position integer not null,
  title text not null,
  instruction text,
  field_label_on_official_page text,
  official_page_name text,
  official_url text,
  extra_links jsonb not null default '[]'::jsonb,
  required_documents jsonb not null default '[]'::jsonb,
  common_mistakes jsonb not null default '[]'::jsonb,
  boost_tip text,
  personalization_key text,
  status text not null default 'draft' check (status in ('draft', 'ready')),
  source_url text,
  last_verified date,
  verified_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, position),
  constraint guide_steps_ready_needs_sources check (
    status = 'draft' or (source_url is not null and last_verified is not null)
  )
);

create table if not exists public.step_screenshots (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.guide_steps (id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  position integer not null default 0,
  highlights jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_step_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  step_id uuid not null references public.guide_steps (id) on delete cascade,
  checked boolean not null default true,
  checked_at timestamptz,
  primary key (user_id, step_id)
);

create table if not exists public.user_notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  step_id uuid not null references public.guide_steps (id) on delete cascade,
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, step_id)
);

create table if not exists public.step_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  step_id uuid not null references public.guide_steps (id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.guides enable row level security;
alter table public.guide_sections enable row level security;
alter table public.guide_steps enable row level security;
alter table public.step_screenshots enable row level security;
alter table public.user_step_progress enable row level security;
alter table public.user_notes enable row level security;
alter table public.step_reports enable row level security;

-- Guide content: everyone signed in reads ready guides; admins read everything.
drop policy if exists "guides_select" on public.guides;
create policy "guides_select" on public.guides for select to authenticated
  using (status = 'ready' or public.is_admin());

drop policy if exists "guide_sections_select" on public.guide_sections;
create policy "guide_sections_select" on public.guide_sections for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.guides g
      where g.id = guide_sections.guide_id and g.status = 'ready'
    )
  );

drop policy if exists "guide_steps_select" on public.guide_steps;
create policy "guide_steps_select" on public.guide_steps for select to authenticated
  using (
    public.is_admin()
    or (
      status = 'ready'
      and source_url is not null
      and last_verified is not null
    )
  );

-- Only admins write guide content.
drop policy if exists "guides_admin_write" on public.guides;
create policy "guides_admin_write" on public.guides for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "guide_sections_admin_write" on public.guide_sections;
create policy "guide_sections_admin_write" on public.guide_sections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "guide_steps_admin_write" on public.guide_steps;
create policy "guide_steps_admin_write" on public.guide_steps for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Screenshots: readable when the parent step is readable.
drop policy if exists "step_screenshots_select" on public.step_screenshots;
create policy "step_screenshots_select" on public.step_screenshots for select to authenticated
  using (
    exists (
      select 1 from public.guide_steps s
      where s.id = step_screenshots.step_id
        and (
          public.is_admin()
          or (s.status = 'ready' and s.source_url is not null and s.last_verified is not null)
        )
    )
  );

drop policy if exists "step_screenshots_admin_write" on public.step_screenshots;
create policy "step_screenshots_admin_write" on public.step_screenshots for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Progress, notes and reports: own rows only.
drop policy if exists "user_step_progress_own" on public.user_step_progress;
create policy "user_step_progress_own" on public.user_step_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "user_notes_own" on public.user_notes;
create policy "user_notes_own" on public.user_notes for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "step_reports_insert_own" on public.step_reports;
create policy "step_reports_insert_own" on public.step_reports for insert to authenticated
  with check ((select auth.uid()) = user_id or user_id is null);

drop policy if exists "step_reports_admin_read" on public.step_reports;
create policy "step_reports_admin_read" on public.step_reports for select to authenticated
  using (public.is_admin() or (select auth.uid()) = user_id);

-- Screenshot bucket. Uploads are admin-only and go through the redaction
-- step in the app; originals are never stored.
insert into storage.buckets (id, name, public)
values ('guide-screenshots', 'guide-screenshots', true)
on conflict (id) do nothing;

drop policy if exists "guide_screenshots_read" on storage.objects;
create policy "guide_screenshots_read" on storage.objects for select
  using (bucket_id = 'guide-screenshots');

drop policy if exists "guide_screenshots_admin_write" on storage.objects;
create policy "guide_screenshots_admin_write" on storage.objects for all to authenticated
  using (bucket_id = 'guide-screenshots' and public.is_admin())
  with check (bucket_id = 'guide-screenshots' and public.is_admin());
