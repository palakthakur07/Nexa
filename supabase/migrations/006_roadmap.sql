-- ============================================================================
-- 006 — Personalized roadmaps
-- ----------------------------------------------------------------------------
-- Run in Supabase SQL Editor AFTER schema.sql and prior numbered migrations.
-- Safe to re-run.
--
-- One row per user holding their generated roadmap (goal, phases, steps,
-- and each step's status). Generation itself is deterministic client-side
-- (lib/roadmapEngine.js, mirroring how lib/matching.js scores opportunities
-- without a network call) — this table only persists the result so progress
-- survives refresh/logout, exactly like `saved_opportunities` persists saves.
-- ============================================================================

create table if not exists public.roadmaps (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid unique not null references auth.users(id) on delete cascade,
  goal           text,
  title          text not null,
  description    text,
  phases         jsonb not null default '[]'::jsonb,
  -- Snapshot of the profile signals the roadmap was generated from, so a
  -- later profile edit can be compared against it to offer "Update my
  -- roadmap" (section 13) instead of silently regenerating.
  generated_from jsonb,
  source         text default 'template',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table public.roadmaps enable row level security;

drop policy if exists "roadmaps_all_own" on public.roadmaps;
create policy "roadmaps_all_own" on public.roadmaps for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_roadmaps_user on public.roadmaps(user_id);
