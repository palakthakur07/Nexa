-- ============================================================================
-- NEXA — Supabase schema
-- ----------------------------------------------------------------------------
-- Run this ONCE in your Supabase project's SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- It creates every table the app reads/writes, enables Row Level Security so
-- each user can only touch their own rows, auto-creates a profile row on
-- signup, and seeds the public "opportunities" and "mentors" catalogs.
-- Safe to re-run: it drops and recreates its own objects.
-- ============================================================================

-- ---------- extensions ----------
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. PROFILES  (one row per auth user — the onboarding answers + roadmap)
-- ============================================================================
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  email                text,
  name                 text default '',
  location             jsonb default '{"country":"","city":"","openToRelocation":""}'::jsonb,
  career_stage         text default '',
  interests            text[] default '{}',
  goals                text[] default '{}',
  skills               text[] default '{}',
  priorities           text[] default '{}',
  help_topics          text[] default '{}',
  give_back            jsonb,
  custom_roadmap_items text[] default '{}',
  onboarding_complete  boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. OPPORTUNITIES  (public catalog — everyone reads, nobody writes via client)
-- ============================================================================
create table if not exists public.opportunities (
  id              text primary key,
  title           text not null,
  organization    text,
  type            text,
  description     text,
  location        text,
  remote          boolean default false,
  categories      text[] default '{}',
  goals           text[] default '{}',
  career_stages   text[] default '{}',
  skills          text[] default '{}',
  funding         jsonb,
  deadline        date,
  eligibility     text[] default '{}',
  benefits        text[] default '{}',
  application_url  text,
  source          text,
  verified        boolean default false,
  created_at      timestamptz default now()
);

alter table public.opportunities enable row level security;
drop policy if exists "opportunities_read_all" on public.opportunities;
create policy "opportunities_read_all" on public.opportunities for select using (true);

-- ============================================================================
-- 3. MENTORS  (public "network" catalog — the women directory)
-- ============================================================================
create table if not exists public.mentors (
  id                    text primary key,
  name                  text not null,
  headline              text,
  location              text,
  about                 text,
  journey               text[] default '{}',
  journey_tags          text[] default '{}',
  relevant_goals        text[] default '{}',
  experience            text[] default '{}',
  skills                text[] default '{}',
  can_help_with         text[] default '{}',
  willing_to_help_with  text[] default '{}',
  languages             text[] default '{}',
  availability          text,
  verified              boolean default false,
  experience_level      text,
  created_at            timestamptz default now()
);

alter table public.mentors enable row level security;
drop policy if exists "mentors_read_all" on public.mentors;
create policy "mentors_read_all" on public.mentors for select using (true);

-- ============================================================================
-- 3b. COMMUNITIES  (public catalog — suggested groups/orgs, was hardcoded
--     client-side sample data before; now a real table like the two above)
-- ============================================================================
create table if not exists public.communities (
  id          text primary key,
  name        text not null,
  category    text,
  why         text,
  created_at  timestamptz default now()
);

alter table public.communities enable row level security;
drop policy if exists "communities_read_all" on public.communities;
create policy "communities_read_all" on public.communities for select using (true);

-- ============================================================================
-- 4. SAVED OPPORTUNITIES  (per user)
-- ============================================================================
create table if not exists public.saved_opportunities (
  user_id        uuid references auth.users(id) on delete cascade,
  opportunity_id text not null,
  status         text default 'Interested',
  saved_at       timestamptz default now(),
  primary key (user_id, opportunity_id)
);

alter table public.saved_opportunities enable row level security;
drop policy if exists "saved_all_own" on public.saved_opportunities;
create policy "saved_all_own" on public.saved_opportunities for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 5. CONNECTION REQUESTS  (mentorship requests sent by the user)
-- ============================================================================
create table if not exists public.connection_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  mentor_id    text,
  topic        text,
  request_type text,
  message      text,
  status       text default 'pending',
  created_at   timestamptz default now()
);

alter table public.connection_requests enable row level security;
drop policy if exists "requests_all_own" on public.connection_requests;
create policy "requests_all_own" on public.connection_requests for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 6. CONVERSATIONS + MESSAGES  (NEXA chat history, per user)
-- ============================================================================
create table if not exists public.conversations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  title         text default 'New conversation',
  entry_context jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.conversations enable row level security;
drop policy if exists "conversations_all_own" on public.conversations;
create policy "conversations_all_own" on public.conversations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete cascade,
  role            text not null,          -- 'user' | 'nexa'
  content         text,
  actions         jsonb default '[]'::jsonb,
  created_at      timestamptz default now()
);

alter table public.messages enable row level security;
drop policy if exists "messages_all_own" on public.messages;
create policy "messages_all_own" on public.messages for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_conversations_user on public.conversations(user_id, updated_at desc);

