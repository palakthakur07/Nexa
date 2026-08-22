// Generates supabase/seed.sql from the existing mock data files.
import { OPPORTUNITIES } from "../src/data/opportunities.js";
import { WOMEN } from "../src/data/women.js";
import { COMMUNITIES } from "../src/data/communities.js";
import fs from "node:fs";

const q = (s) => (s === null || s === undefined ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const arr = (a) => (a && a.length ? `array[${a.map(q).join(",")}]::text[]` : "'{}'::text[]");
const jsonb = (o) => (o === null || o === undefined ? "null" : `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`);
const bool = (b) => (b ? "true" : "false");
const date = (d) => (d ? `'${d}'::date` : "null");

let sql = `-- AUTO-GENERATED seed data for NEXA. Run AFTER schema.sql.\n-- Idempotent: re-running upserts the same catalog rows.\n\n`;

sql += "insert into public.opportunities\n";
sql += "  (id,title,organization,type,description,location,remote,categories,goals,career_stages,skills,funding,deadline,eligibility,benefits,application_url,source,verified) values\n";
sql += OPPORTUNITIES.map((o) =>
  `  (${q(o.id)},${q(o.title)},${q(o.organization)},${q(o.type)},${q(o.description)},${q(o.location)},${bool(o.remote)},${arr(o.categories)},${arr(o.goals)},${arr(o.careerStages)},${arr(o.skills)},${jsonb(o.funding)},${date(o.deadline)},${arr(o.eligibility)},${arr(o.benefits)},${q(o.applicationUrl)},${q(o.source)},${bool(o.verified)})`
).join(",\n");
sql += "\non conflict (id) do update set\n";
sql += "  title=excluded.title, organization=excluded.organization, type=excluded.type, description=excluded.description,\n";
sql += "  location=excluded.location, remote=excluded.remote, categories=excluded.categories, goals=excluded.goals,\n";
sql += "  career_stages=excluded.career_stages, skills=excluded.skills, funding=excluded.funding, deadline=excluded.deadline,\n";
sql += "  eligibility=excluded.eligibility, benefits=excluded.benefits, application_url=excluded.application_url,\n";
sql += "  source=excluded.source, verified=excluded.verified;\n\n";

sql += "insert into public.mentors\n";
sql += "  (id,name,headline,location,about,journey,journey_tags,relevant_goals,experience,skills,can_help_with,willing_to_help_with,languages,availability,verified,experience_level) values\n";
sql += WOMEN.map((w) =>
  `  (${q(w.id)},${q(w.name)},${q(w.headline)},${q(w.location)},${q(w.about)},${arr(w.journey)},${arr(w.journeyTags)},${arr(w.relevantGoals)},${arr(w.experience)},${arr(w.skills)},${arr(w.canHelpWith)},${arr(w.willingToHelpWith)},${arr(w.languages)},${q(w.availability)},${bool(w.verified)},${q(w.experienceLevel)})`
).join(",\n");
sql += "\non conflict (id) do update set\n";
sql += "  name=excluded.name, headline=excluded.headline, location=excluded.location, about=excluded.about,\n";
sql += "  journey=excluded.journey, journey_tags=excluded.journey_tags, relevant_goals=excluded.relevant_goals,\n";
sql += "  experience=excluded.experience, skills=excluded.skills, can_help_with=excluded.can_help_with,\n";
sql += "  willing_to_help_with=excluded.willing_to_help_with, languages=excluded.languages,\n";
sql += "  availability=excluded.availability, verified=excluded.verified, experience_level=excluded.experience_level;\n\n";

sql += "insert into public.communities\n";
sql += "  (id,name,category,why) values\n";
sql += COMMUNITIES.map((c) =>
  `  (${q(c.id)},${q(c.name)},${q(c.category)},${q(c.why)})`
).join(",\n");
sql += "\non conflict (id) do update set\n";
sql += "  name=excluded.name, category=excluded.category, why=excluded.why;\n";

fs.writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log("Wrote supabase/seed.sql:", OPPORTUNITIES.length, "opportunities,", WOMEN.length, "mentors,", COMMUNITIES.length, "communities");

