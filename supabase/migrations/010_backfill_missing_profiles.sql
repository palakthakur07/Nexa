-- ============================================================================
-- Backfill: create a profiles row for any existing auth.users that don't
-- have one yet.
--
-- Why this is needed: profiles.* was only ever written via UPDATE from the
-- client (ProfileContext.jsx / dataService.js). UPDATE on a row that doesn't
-- exist matches zero rows and succeeds with no error — so any account whose
-- profiles row was never created (e.g. it signed up before the
-- on_auth_user_created trigger existed, or that trigger failed once) could
-- "save" its profile all day in the UI and nothing ever reached the
-- database. On next reload the SELECT ... .single() found 0 rows, threw,
-- and the app reset to a blank profile.
--
-- This is a one-time fix for accounts already in that state. Going forward,
-- the client uses upsert() instead of update(), so this can't recur — but
-- that only fixes *future* saves, not accounts already missing a row.
--
-- Safe to re-run: ON CONFLICT DO NOTHING skips rows that already exist.
-- ============================================================================

insert into public.profiles (id, email, name)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;