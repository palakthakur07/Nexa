-- Remove the legacy demo mentor from both mentorship data models.
-- Real user-created profiles are left untouched.
delete from public.mentors
where lower(trim(name)) = 'meera iyer';

delete from public.profiles
where lower(trim(coalesce(name, ''))) = 'meera iyer'
  and is_mentor = true;