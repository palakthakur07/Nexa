-- ============================================================================
-- NEXA — Opportunity Engine migration (Phases 1-5)
-- ----------------------------------------------------------------------------
-- Run this ONCE, AFTER schema.sql, in the Supabase SQL Editor.
-- Additive and idempotent: every statement uses `if not exists` / `create or
-- replace` / `drop ... if exists` so it's safe to re-run.
--
-- What this adds on top of schema.sql:
--   1. Organizations (accounts real orgs use to submit + manage listings)
--   2. Verification workflow + provenance fields on opportunities
--   3. Ownership-based RLS so an org can only touch its own listings
--   4. Opportunity source registry + ingestion log (Phase 2 architecture)
--   5. Notifications + preferences (Phase 5 foundation)
-- It does NOT delete or rewrite anything schema.sql created — the existing
-- `opportunities`, `profiles`, `saved_opportunities` etc. tables are altered
-- in place, not dropped.
-- ============================================================================

-- ============================================================================
-- 1. ORGANIZATIONS
-- ============================================================================
create table if not exists public.organizations (
  id                   uuid primary key default gen_random_uuid(),
  owner_id             uuid references auth.users(id) on delete cascade,
  name                 text not null,
  website              text,
  logo_url             text,
  description          text,
  org_type             text,                          -- e.g. Nonprofit, University, Government, Company, Foundation
  contact_name         text,
  contact_email        text,
  -- UNVERIFIED | PENDING_VERIFICATION | VERIFIED | SUSPENDED
  verification_status  text not null default 'UNVERIFIED',
  verified_at          timestamptz,
  verified_by          uuid references auth.users(id),
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

alter table public.organizations enable row level security;

drop policy if exists "organizations_read_all" on public.organizations;
create policy "organizations_read_all" on public.organizations for select using (true);

drop policy if exists "organizations_insert_own" on public.organizations;
create policy "organizations_insert_own" on public.organizations for insert
  with check (auth.uid() = owner_id);

drop policy if exists "organizations_update_own_or_admin" on public.organizations;
create policy "organizations_update_own_or_admin" on public.organizations for update
  using (
    auth.uid() = owner_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Same pattern as protect_is_admin(): an org owner can edit their own profile
-- fields, but cannot flip their own verification_status to VERIFIED — only an
-- admin (or a trusted server-side context with no auth.uid(), e.g. you running
-- SQL directly) can do that.
create or replace function public.protect_org_verification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.verification_status is distinct from old.verification_status then
    if auth.uid() is not null and not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
      new.verification_status := old.verification_status;
      new.verified_at := old.verified_at;
      new.verified_by := old.verified_by;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_org_verification_trigger on public.organizations;
create trigger protect_org_verification_trigger
  before update on public.organizations
  for each row execute function public.protect_org_verification();

create index if not exists idx_organizations_owner on public.organizations(owner_id);

-- ============================================================================
-- 2. OPPORTUNITIES — verification workflow + provenance
-- ============================================================================
alter table public.opportunities add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.opportunities add column if not exists submitted_by uuid references auth.users(id);
-- MANUAL | ORGANIZATION | API | RSS | DATASET | WEB | USER_SUBMISSION
alter table public.opportunities add column if not exists source_type text default 'MANUAL';
alter table public.opportunities add column if not exists source_name text;
-- source_url: where the info was found/verified. Distinct from application_url
-- (where a candidate applies) — a listing can be sourced from a news article
-- or gov portal but apply on the org's own site.
alter table public.opportunities add column if not exists source_url text;
-- DRAFT | PENDING_REVIEW | VERIFIED | PUBLISHED | REJECTED | EXPIRED
alter table public.opportunities add column if not exists verification_status text not null default 'PUBLISHED';
alter table public.opportunities add column if not exists verified_at timestamptz;
alter table public.opportunities add column if not exists verified_by uuid references auth.users(id);
alter table public.opportunities add column if not exists last_verified_at timestamptz;
alter table public.opportunities add column if not exists published_at timestamptz;
alter table public.opportunities add column if not exists rejection_reason text;
alter table public.opportunities add column if not exists updated_at timestamptz default now();
-- ingestion dedup: a stable fingerprint of application_url + org + title,
-- populated by the ingestion pipeline (see supabase/functions/ingest-opportunities).
alter table public.opportunities add column if not exists dedupe_key text;

-- Existing rows created before this migration are legacy admin-curated data;
-- default them to PUBLISHED so nothing already live disappears. New rows
-- default to PUBLISHED too UNLESS inserted by the app layer with an explicit
-- DRAFT/PENDING_REVIEW status (org submissions, ingestion).
update public.opportunities set verification_status = 'PUBLISHED' where verification_status is null;

create index if not exists idx_opportunities_org on public.opportunities(organization_id);
create index if not exists idx_opportunities_verification on public.opportunities(verification_status);
create index if not exists idx_opportunities_dedupe on public.opportunities(dedupe_key);

-- ---------- RLS: replace the old "everyone reads everything" policy ----------
-- Public/anon and regular signed-in users should only see PUBLISHED listings.
-- An org can additionally see its own (any status). Admins see everything.
drop policy if exists "opportunities_read_all" on public.opportunities;
drop policy if exists "opportunities_read_published_or_own" on public.opportunities;
create policy "opportunities_read_published_or_own" on public.opportunities for select
  using (
    verification_status = 'PUBLISHED'
    or auth.uid() = submitted_by
    or exists (
      select 1 from public.organizations o
      where o.id = opportunities.organization_id and o.owner_id = auth.uid()
    )
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------- RLS: writes ----------
-- Admins keep full write access (unchanged in spirit from schema.sql).
drop policy if exists "opportunities_write_admin" on public.opportunities;
create policy "opportunities_write_admin" on public.opportunities for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
drop policy if exists "opportunities_update_admin" on public.opportunities;
drop policy if exists "opportunities_delete_admin" on public.opportunities;
create policy "opportunities_delete_admin" on public.opportunities for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- A verified organization's owner may insert opportunities under their own
-- organization_id. (Even unverified orgs can draft/submit — see the trigger
-- below, which forces the status to PENDING_REVIEW regardless of what the
-- client sends, so an unverified org can't self-publish.)
drop policy if exists "opportunities_insert_org_owner" on public.opportunities;
create policy "opportunities_insert_org_owner" on public.opportunities for insert
  with check (
    organization_id is not null
    and exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = auth.uid())
  );

-- An org owner may update only their own organization's listings.
drop policy if exists "opportunities_update_org_owner" on public.opportunities;
create policy "opportunities_update_org_owner" on public.opportunities for update
  using (
    exists (select 1 from public.organizations o where o.id = opportunities.organization_id and o.owner_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Org owners may withdraw (delete) their own drafts/pending listings, but not
-- once something is PUBLISHED (they should close it instead, preserving the
-- historical record) — enforced in the app layer's dataService, not RLS,
-- since RLS `using` on delete only sees the row being deleted, which is fine
-- for ownership but awkward for status gating; the app checks status first.
drop policy if exists "opportunities_delete_org_owner" on public.opportunities;
create policy "opportunities_delete_org_owner" on public.opportunities for delete
  using (exists (select 1 from public.organizations o where o.id = opportunities.organization_id and o.owner_id = auth.uid()));

-- ---------- Trigger: enforce the verification workflow server-side ----------
-- No client — admin UI included — can set an opportunity straight to
-- PUBLISHED/VERIFIED via a normal request. Only an admin (or a trusted
-- server-side context with no auth.uid()) can move a row into those states,
-- and only an admin can clear a REJECTED status. A plain org-owner write is
-- forced into DRAFT/PENDING_REVIEW/EXPIRED regardless of what it sent.
create or replace function public.protect_opportunity_verification()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_admin_user boolean;
begin
  is_admin_user := auth.uid() is null or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true);

  if new.verification_status is distinct from old.verification_status then
    if not is_admin_user and new.verification_status in ('VERIFIED', 'PUBLISHED') then
      new.verification_status := 'PENDING_REVIEW';
    end if;
    if is_admin_user and new.verification_status in ('VERIFIED', 'PUBLISHED') then
      new.verified_at := now();
      new.verified_by := auth.uid();
      new.last_verified_at := now();
      if new.verification_status = 'PUBLISHED' and old.published_at is null then
        new.published_at := now();
      end if;
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_opportunity_verification_trigger on public.opportunities;
create trigger protect_opportunity_verification_trigger
  before update on public.opportunities
  for each row execute function public.protect_opportunity_verification();

-- On INSERT, an org-owner submission is always forced to PENDING_REVIEW no
-- matter what the client sends (mirrors "Do not immediately trust arbitrary
-- submissions"). Admin/service-role inserts pass through unchanged.
create or replace function public.protect_opportunity_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_admin_user boolean;
begin
  is_admin_user := auth.uid() is null or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true);
  if not is_admin_user then
    new.verification_status := 'PENDING_REVIEW';
    new.submitted_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists protect_opportunity_insert_trigger on public.opportunities;
create trigger protect_opportunity_insert_trigger
  before insert on public.opportunities
  for each row execute function public.protect_opportunity_insert();

-- ============================================================================
-- 3. OPPORTUNITY SOURCES — registry for Phase 2 ingestion (admin-only)
-- ============================================================================
create table if not exists public.opportunity_sources (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  website            text,
  source_url         text,               -- the feed/API/dataset endpoint itself
  -- API | RSS | DATASET | WEB | MANUAL | USER_SUBMISSION | ORGANIZATION
  source_type        text not null default 'RSS',
  method             text,               -- free-text notes on how it's fetched
  -- LOW | MEDIUM | HIGH — how much an ingested row from this source is
  -- trusted; does not bypass verification, only informs the admin review UI.
  trust_level        text not null default 'MEDIUM',
  enabled            boolean default false,
  refresh_frequency  text default 'daily',
  last_checked_at    timestamptz,
  last_success_at    timestamptz,
  last_error         text,
  opportunities_found integer default 0,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

alter table public.opportunity_sources enable row level security;
drop policy if exists "sources_admin_all" on public.opportunity_sources;
create policy "sources_admin_all" on public.opportunity_sources for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create table if not exists public.opportunity_ingestion_log (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid references public.opportunity_sources(id) on delete cascade,
  started_at      timestamptz default now(),
  finished_at     timestamptz,
  -- SUCCESS | FAILURE | PARTIAL
  status          text,
  items_found     integer default 0,
  items_created   integer default 0,
  items_updated   integer default 0,
  items_duplicate integer default 0,
  items_rejected  integer default 0,
  error_message   text
);

alter table public.opportunity_ingestion_log enable row level security;
drop policy if exists "ingestion_log_admin_read" on public.opportunity_ingestion_log;
create policy "ingestion_log_admin_read" on public.opportunity_ingestion_log for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
-- Inserts/updates to the log happen from the ingest-opportunities Edge
-- Function using the service_role key, which bypasses RLS entirely — no
-- client-side insert policy is needed or granted.

-- ============================================================================
-- 4. NOTIFICATIONS (Phase 5 foundation)
-- ============================================================================
create table if not exists public.notification_preferences (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  new_matches         boolean default true,
  deadline_reminders  boolean default true,
  opportunity_updates boolean default true,
  updated_at          timestamptz default now()
);

alter table public.notification_preferences enable row level security;
drop policy if exists "notification_prefs_own" on public.notification_preferences;
create policy "notification_prefs_own" on public.notification_preferences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  -- NEW_MATCH | DEADLINE_APPROACHING | OPPORTUNITY_UPDATED | OPPORTUNITY_REOPENED
  type            text not null,
  title           text not null,
  body            text,
  opportunity_id  text references public.opportunities(id) on delete cascade,
  read            boolean default false,
  created_at      timestamptz default now()
);

alter table public.notifications enable row level security;
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id);
drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications for delete using (auth.uid() = user_id);
-- No client insert policy on purpose: notifications are written server-side
-- (service role, from a scheduled function) so a user can never fabricate
-- their own "new match" notifications.

create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

-- ============================================================================
-- 5. SAVED OPPORTUNITIES — align status vocabulary with the request tracker
-- ============================================================================
-- schema.sql already has this table with a free-text `status` column and the
-- app already writes richer values than SAVED/APPLIED/NOT_INTERESTED
-- (see src/context/SavedContext.jsx APPLICATION_STATUSES). No structural
-- change needed — left as-is so existing saved rows keep working.

-- ============================================================================
-- Done. Next: run this file's counterpart application-layer changes (already
-- in this codebase) and see README.md's "Opportunity Engine" section for the
-- admin/organization/ingestion setup steps.
-- ============================================================================
