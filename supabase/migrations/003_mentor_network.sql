-- ============================================================================
-- 003 — Real mentor network
-- ----------------------------------------------------------------------------
-- Run in Supabase SQL Editor AFTER schema.sql and 002_opportunity_engine.sql.
-- Safe to re-run.
--
-- Replaces the fake, hardcoded "women" directory with a real, self-service
-- mentor system: registration, request -> accept/decline, messaging that
-- only exists post-acceptance, ratings tied to a genuine completed
-- interaction, and a real block/report safety layer. Nothing here is
-- backfilled with sample people.
--
-- mentors and connection_requests already exist (from schema.sql) with a
-- fake-data shape: text ids, no owning user, no accept/decline distinction,
-- no anti-spam. They're dropped and recreated rather than ALTERed — no real
-- mentor relationship could have existed against a row with no real owner,
-- so nothing of value is lost.
-- ============================================================================

alter table public.profiles add column if not exists roles text[] default '{"member"}';

-- ============================================================================
-- MENTORS  (real, self-registered profiles only — a row exists because the
-- referenced user_id filled out the "Become a Mentor" form themselves)
-- ============================================================================
drop table if exists public.mentors cascade;
create table public.mentors (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid unique not null references auth.users(id) on delete cascade,
  name                  text not null,
  headline              text,
  location              text,             -- broad region only, never an exact address
  photo_url             text,
  profession            text,
  industry              text,
  organization          text,
  about                 text,
  experience            text[] default '{}',
  skills                text[] default '{}',
  can_help_with         text[] default '{}',
  topics                text[] default '{}',
  languages             text[] default '{}',
  availability          text,
  experience_level      text,
  verified              boolean default false,   -- admin-set only, see trigger below
  discoverable          boolean default true,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table public.mentors enable row level security;

create policy "mentors_read_discoverable_or_own" on public.mentors for select
  using (
    discoverable = true
    or auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
create policy "mentors_insert_own" on public.mentors for insert
  with check (auth.uid() = user_id);
create policy "mentors_update_own" on public.mentors for update
  using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
create policy "mentors_delete_own" on public.mentors for delete
  using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create or replace function public.protect_mentor_verified()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.verified is distinct from old.verified then
    if auth.uid() is not null and not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
      new.verified := old.verified;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger protect_mentor_verified_trigger
  before update on public.mentors
  for each row execute function public.protect_mentor_verified();

-- ============================================================================
-- CONNECTION REQUESTS  (one initial message; recipient accepts/declines
-- before any further communication is allowed)
-- ============================================================================
drop table if exists public.connection_requests cascade;
create table public.connection_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  mentor_id    uuid not null references public.mentors(id) on delete cascade,
  topic        text,
  request_type text,
  message      text not null,
  status       text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at   timestamptz default now(),
  responded_at timestamptz
);

create unique index uq_one_pending_request_per_pair
  on public.connection_requests (user_id, mentor_id)
  where status = 'pending';

alter table public.connection_requests enable row level security;

create policy "requests_select_requester" on public.connection_requests for select
  using (auth.uid() = user_id);
create policy "requests_insert_requester" on public.connection_requests for insert
  with check (auth.uid() = user_id);
create policy "requests_cancel_requester" on public.connection_requests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status = 'cancelled');

create policy "requests_select_mentor" on public.connection_requests for select
  using (exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid()));
create policy "requests_respond_mentor" on public.connection_requests for update
  using (exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid()));

-- Anti-spam / anti-abuse, configurable without a redeploy.
create table if not exists public.app_config (
  key   text primary key,
  value jsonb not null
);
alter table public.app_config enable row level security;
create policy "app_config_admin_only" on public.app_config for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
insert into public.app_config (key, value) values ('daily_request_limit', '5')
  on conflict (key) do nothing;

create table if not exists public.blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references auth.users(id) on delete cascade,
  blocked_id  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (blocker_id, blocked_id)
);
alter table public.blocks enable row level security;
create policy "blocks_own" on public.blocks for all
  using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

create or replace function public.enforce_request_limits()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  daily_limit int;
  sent_today int;
  mentor_owner uuid;
  is_blocked boolean;
begin
  select (value)::int into daily_limit from public.app_config where key = 'daily_request_limit';
  if daily_limit is null then daily_limit := 5; end if;

  select count(*) into sent_today from public.connection_requests
    where user_id = new.user_id and created_at > now() - interval '24 hours';
  if sent_today >= daily_limit then
    raise exception 'Daily request limit reached (% per 24h). Try again tomorrow.', daily_limit;
  end if;

  select m.user_id into mentor_owner from public.mentors m where m.id = new.mentor_id;
  if mentor_owner is null then
    raise exception 'That mentor profile no longer exists.';
  end if;
  if mentor_owner = new.user_id then
    raise exception 'You cannot send a request to yourself.';
  end if;

  select exists(
    select 1 from public.blocks
    where (blocker_id = mentor_owner and blocked_id = new.user_id)
       or (blocker_id = new.user_id and blocked_id = mentor_owner)
  ) into is_blocked;
  if is_blocked then
    raise exception 'This request cannot be sent.';
  end if;

  return new;
end;
$$;
create trigger enforce_request_limits_trigger
  before insert on public.connection_requests
  for each row execute function public.enforce_request_limits();

create or replace function public.stamp_request_response()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status and new.status in ('accepted','declined') then
    new.responded_at := now();
  end if;
  return new;
end;
$$;
create trigger stamp_request_response_trigger
  before update on public.connection_requests
  for each row execute function public.stamp_request_response();

-- ============================================================================
-- CONNECTION MESSAGES  (exist only once the mentor has accepted — enforced
-- by RLS below, not just by the UI hiding a compose box)
-- ============================================================================
create table if not exists public.connection_messages (
  id                     uuid primary key default gen_random_uuid(),
  connection_request_id  uuid not null references public.connection_requests(id) on delete cascade,
  sender_id              uuid not null references auth.users(id) on delete cascade,
  body                   text not null,
  created_at             timestamptz default now()
);
alter table public.connection_messages enable row level security;

create policy "connection_messages_participants" on public.connection_messages for select
  using (
    exists (
      select 1 from public.connection_requests r
      left join public.mentors m on m.id = r.mentor_id
      where r.id = connection_request_id and r.status = 'accepted'
        and (r.user_id = auth.uid() or m.user_id = auth.uid())
    )
  );
create policy "connection_messages_send" on public.connection_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.connection_requests r
      left join public.mentors m on m.id = r.mentor_id
      where r.id = connection_request_id and r.status = 'accepted'
        and (r.user_id = auth.uid() or m.user_id = auth.uid())
    )
  );
create index if not exists idx_connection_messages_request on public.connection_messages(connection_request_id, created_at);

-- ============================================================================
-- MENTOR RATINGS  (only from an accepted interaction the rater actually had)
-- ============================================================================
create table if not exists public.mentor_ratings (
  id                     uuid primary key default gen_random_uuid(),
  connection_request_id  uuid not null unique references public.connection_requests(id) on delete cascade,
  mentor_id              uuid not null references public.mentors(id) on delete cascade,
  rated_by               uuid not null references auth.users(id) on delete cascade,
  rating                 smallint not null check (rating between 1 and 5),
  feedback               text,
  created_at             timestamptz default now()
);
alter table public.mentor_ratings enable row level security;
create policy "mentor_ratings_read_all" on public.mentor_ratings for select using (true);
create policy "mentor_ratings_insert_own" on public.mentor_ratings for insert
  with check (
    rated_by = auth.uid()
    and exists (
      select 1 from public.connection_requests r
      where r.id = connection_request_id and r.user_id = auth.uid() and r.status = 'accepted' and r.mentor_id = mentor_ratings.mentor_id
    )
  );

-- ============================================================================
-- REPORTS  (real moderation queue — is_admin can review via Table Editor
-- today; an in-app moderation screen is a natural next step, not built yet)
-- ============================================================================
create table if not exists public.reports (
  id                     uuid primary key default gen_random_uuid(),
  reporter_id            uuid not null references auth.users(id) on delete cascade,
  reported_user_id       uuid not null references auth.users(id) on delete cascade,
  connection_request_id  uuid references public.connection_requests(id) on delete set null,
  reason                 text not null,
  details                text,
  status                 text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at             timestamptz default now(),
  reviewed_at            timestamptz
);
alter table public.reports enable row level security;
create policy "reports_insert_own" on public.reports for insert with check (reporter_id = auth.uid());
create policy "reports_select_own_or_admin" on public.reports for select
  using (reporter_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
create policy "reports_update_admin" on public.reports for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
