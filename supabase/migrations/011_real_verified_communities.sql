-- 009_fix_communities_url.sql only nulled out the url column for the
-- unverified rows (c3,c4,c5,c6,c7,c8,c10,c11,c12) — it left the fabricated
-- ORGANIZATION NAMES in place (e.g. "Design Sisterhood", "Global STEM
-- Network", "Women in Leadership"), which is why the Dashboard "Communities"
-- card still showed made-up groups, just with the link disabled instead of
-- broken. That's still fake data, not real data — the user should be able
-- to click every card and land on an actual organization.
--
-- This migration replaces every row (except c1 Women in AI and c9 EdTech
-- Women, which were already correct) with a real organization in the same
-- category, individually verified by web search as of Aug 2026:
--
--   c2  Women Founders            -> Women Founders Network      https://www.womenfoundersnetwork.org/
--   c3  Global STEM Network       -> Association for Women in Science (AWIS)  https://awis.org/
--   c4  Women in Leadership       -> Chief                       https://chief.com/
--   c5  Design Sisterhood         -> Ladies, Wine & Design        https://ladieswinedesign.com/
--   c6  Women in Finance Network  -> Financial Women's Association https://www.fwa.org/
--   c7  Women in Medicine         -> American Medical Women's Association (AMWA) https://amwa-doc.org/
--   c8  Women in Law              -> National Association of Women Lawyers (NAWL) https://www.nawl.org/
--   c10 Women in Media & News     -> Alliance for Women in Media  https://allwomeninmedia.org/
--   c11 Social Impact Collective  -> Vital Voices                 https://www.vitalvoices.org/
--   c12 Early Career Circle       -> Ellevate Network             https://ellevatenetwork.com/

update public.communities set
  name = 'Women Founders Network',
  why  = 'Nonprofit providing education, coaching, and funding access for women founders.',
  url  = 'https://www.womenfoundersnetwork.org/'
where id = 'c2';

update public.communities set
  name = 'Association for Women in Science',
  why  = 'National advocacy organization and peer network for women across every STEM discipline.',
  url  = 'https://awis.org/'
where id = 'c3';

update public.communities set
  name = 'Chief',
  why  = 'Private membership network and executive coaching community for senior women leaders.',
  url  = 'https://chief.com/'
where id = 'c4';

update public.communities set
  name = 'Ladies, Wine & Design',
  why  = 'Global chapter-based nonprofit offering mentorship and portfolio reviews for women in creative fields.',
  url  = 'https://ladieswinedesign.com/'
where id = 'c5';

update public.communities set
  name = 'Financial Women''s Association',
  why  = 'Professional association since 1956 for women in banking, investing, and fintech.',
  url  = 'https://www.fwa.org/'
where id = 'c6';

update public.communities set
  name = 'American Medical Women''s Association',
  why  = 'The oldest multispecialty organization advancing women physicians and medical students.',
  url  = 'https://amwa-doc.org/'
where id = 'c7';

update public.communities set
  name = 'National Association of Women Lawyers',
  why  = 'National organization advancing women in the legal profession since 1899.',
  url  = 'https://www.nawl.org/'
where id = 'c8';

update public.communities set
  name = 'Alliance for Women in Media',
  why  = 'The longest-established professional association advancing women across broadcasting and media.',
  url  = 'https://allwomeninmedia.org/'
where id = 'c10';

update public.communities set
  name = 'Vital Voices',
  why  = 'Global network investing in women leaders driving human rights and economic change.',
  url  = 'https://www.vitalvoices.org/'
where id = 'c11';

update public.communities set
  name = 'Ellevate Network',
  why  = 'Global professional women''s network with peer mentoring and local chapters, from early career to executive.',
  url  = 'https://ellevatenetwork.com/'
where id = 'c12';