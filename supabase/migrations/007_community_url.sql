-- Adds an external link + interest/priority tags to communities, so:
--  1) the "open" arrow on community cards actually goes somewhere, and
--  2) the Dashboard "Communities" card ranks communities against the
--     signed-in user's own profile instead of always showing the same
--     fixed three.
alter table public.communities add column if not exists url text;
alter table public.communities add column if not exists interests text[] default '{}';
alter table public.communities add column if not exists priorities text[] default '{}';

insert into public.communities
  (id,name,category,why,url,interests,priorities) values
  ('c1','Women in AI','Technology','Active peer group for women working in or studying AI.','https://www.womeninai.co/','{"AI & Technology"}','{"Women-focused opportunities"}'),
  ('c2','Women Founders','Entrepreneurship','Founders sharing funding leads and early-stage advice.','https://www.womenfounders.org/','{"Entrepreneurship","Business"}','{"Women-focused opportunities","Networking"}'),
  ('c3','Global STEM Network','Research','International community for women in research and academia.','https://www.globalstemnetwork.org/','{"Research","AI & Technology"}','{"Networking"}'),
  ('c4','Women in Leadership','Career growth','Focused on career progression into senior roles.','https://www.womeninleadership.org/','{"Leadership"}','{"Career growth","Women-focused opportunities"}'),
  ('c5','Design Sisterhood','Design & Creativity','Portfolio feedback and job leads for women in design.','https://www.designsisterhood.com/','{"Design & Creativity"}','{"Networking","Women-focused opportunities"}'),
  ('c6','Women in Finance Network','Finance','Community for women in banking, investing, and fintech.','https://www.wifn.org/','{"Finance"}','{"Career growth","Women-focused opportunities"}'),
  ('c7','Women in Medicine','Healthcare','Peer support and mentorship across medical careers.','https://www.womeninmedicine.org/','{"Healthcare"}','{"Mentorship","Women-focused opportunities"}'),
  ('c8','Women in Law','Law','Network for law students and practicing attorneys.','https://www.womeninlaw.org/','{"Law"}','{"Mentorship","Women-focused opportunities"}'),
  ('c9','EdTech Women','Education','Educators and founders building the future of learning.','https://www.edtechwomen.com/','{"Education"}','{"Networking","Women-focused opportunities"}'),
  ('c10','Women in Media & News','Media','Journalists and creators supporting each other''s work.','https://www.wimn.org/','{"Media"}','{"Networking","Women-focused opportunities"}'),
  ('c11','Social Impact Collective','Social Impact','Changemakers working on nonprofits and social ventures.','https://www.socialimpactcollective.org/','{"Social Impact"}','{"Mentorship","Networking"}'),
  ('c12','Early Career Circle','Career growth','Peer support for people early in their careers.','https://www.earlycareercircle.org/','{"Business","Leadership"}','{"Mentorship","Career growth"}')
on conflict (id) do update set
  name=excluded.name, category=excluded.category, why=excluded.why, url=excluded.url,
  interests=excluded.interests, priorities=excluded.priorities;