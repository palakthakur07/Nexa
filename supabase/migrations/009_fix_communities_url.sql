-- 007_community_url.sql seeded plausible-sounding but largely unverified
-- URLs (several are outright fake domains, e.g. designsisterhood.com does
-- not resolve at all). This migration corrects the ones confirmed real and
-- nulls out everything unverified so the Communities card falls back to a
-- non-clickable row (see Dashboard.jsx: `const Row = c.url ? "a" : "div"`)
-- instead of linking somewhere broken or wrong.
--
-- Confirmed real as of Aug 2026:
--   c1  Women in AI              -> https://www.womeninai.co/            (correct, unchanged)
--   c9  EdTech Women             -> https://www.edtechwomen.com/         (correct, unchanged)
-- Corrected to the real organization's actual domain:
--   c2  Women Founders           -> https://www.womenfoundersnetwork.org/
-- Unverified / not confirmed as real orgs -> nulled until checked:
--   c3, c4, c5, c6, c7, c8, c10, c11, c12

update public.communities set url = 'https://www.womenfoundersnetwork.org/' where id = 'c2';

update public.communities set url = null where id in
  ('c3','c4','c5','c6','c7','c8','c10','c11','c12');