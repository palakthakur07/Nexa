-- ============================================================================
-- 006 — Roadmap
-- ----------------------------------------------------------------------------
-- Real, persisted, per-user roadmap: one row per user holding a generated
-- plan (goal, phases, steps) plus a snapshot of the profile fields it was
-- generated from (used to detect staleness when goals/interests change).
-- Progress is never stored as a bare number — it's always derived from the
-- actual step statuses inside `phases` at read time (see roadmapEngine.js).
-- Safe to re-run.
-- ============================================================================

create table if not exists public.roadmaps (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references auth.users(id) on delete cascade,
  goal_key          text not null,
  title             text not null,
  description       text,
  phases            jsonb not null default '[]'::jsonb,
  source_snapshot   jsonb,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.roadmaps enable row level security;

drop policy if exists "roadmaps_select_own" on public.roadmaps;
drop policy if exists "roadmaps_insert_own" on public.roadmaps;
drop policy if exists "roadmaps_update_own" on public.roadmaps;
drop policy if exists "roadmaps_delete_own" on public.roadmaps;

create policy "roadmaps_select_own" on public.roadmaps for select using (auth.uid() = user_id);
create policy "roadmaps_insert_own" on public.roadmaps for insert with check (auth.uid() = user_id);
create policy "roadmaps_update_own" on public.roadmaps for update using (auth.uid() = user_id);
create policy "roadmaps_delete_own" on public.roadmaps for delete using (auth.uid() = user_id);

create index if not exists idx_roadmaps_user on public.roadmaps(user_id);
