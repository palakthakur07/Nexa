# NEXA

A career-opportunity discovery platform, a women's mentorship network, and a
context-aware AI assistant (NEXA) — now backed by **real authentication and a
real database (Supabase)**, with a cinematic, animated UI (Framer Motion).

Landing → sign up / log in → onboarding → dashboard → discover → network → NEXA.

---

## What changed in this version

- **Real auth** — email/password, Google OAuth, password reset, and email
  verification, all via Supabase. Product routes are protected; signed-out
  users are redirected to `/login`.
- **Real data** — the opportunities catalog, mentor network, saved
  opportunities, connection requests, and NEXA conversations are now stored in
  Supabase (Postgres) with Row Level Security, per user. **No more mock/demo
  data or fake seeded requests.**
- **Cinematic animations** — smooth page transitions, an animated nav bar,
  scroll-reveal + lift-on-hover cards, and animated auth screens (Framer
  Motion). Respects `prefers-reduced-motion`.
- **Graceful fallback** — if Supabase env vars are absent, the app runs in a
  local demo mode (bundled sample data + localStorage) so it still boots with
  zero configuration.

---

## Prerequisites

- **Node.js 18+** and npm
- A free **Supabase** account — https://supabase.com

---

## Setup (one time)

### 1. Install dependencies
```bash
npm install
```

### 2. Create a Supabase project
1. Go to https://supabase.com → **New project** (the free tier is enough).
2. Wait for it to finish provisioning.

### 3. Create the database schema
1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   - This creates all tables, Row Level Security policies, and the trigger that
     auto-creates a profile row on signup.
3. Open another **New query**, paste [`supabase/seed-demo.sql`](supabase/seed-demo.sql), and **Run** — **only in a local/dev project.**
   - This loads fabricated sample opportunities/mentors so a fresh install has
     something to click through. **Do not run this against production** — see
     "Opportunity Engine → Phase 1" below for how real opportunities get in.
4. Open another **New query**, paste [`supabase/migrations/002_opportunity_engine.sql`](supabase/migrations/002_opportunity_engine.sql), and **Run**.
   - This adds the verification workflow, organizations, source registry, and
     notifications tables described below. Safe to re-run.

> All three files are safe to re-run — they use `create ... if not exists` and
> `on conflict ... do update` (idempotent upserts).

### 4. Enable authentication providers
- **Email/password** is on by default.
- **Email verification:** Dashboard → **Authentication → Providers → Email** —
  toggle "Confirm email" on (recommended) or off (instant login for testing).
- **Google OAuth:** Dashboard → **Authentication → Providers → Google** —
  enable it and paste your Google OAuth client ID + secret
  (from https://console.cloud.google.com → APIs & Services → Credentials).
  Add this authorized redirect URL in Google Cloud:
  `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`

### 5. Configure redirect URLs
Dashboard → **Authentication → URL Configuration**:
- **Site URL:** `http://localhost:5173` (Vite's default dev URL)
- **Redirect URLs:** add `http://localhost:5173/**`
  (and your production URL later, e.g. `https://yourdomain.com/**`)

### 6. Add your keys to `.env`
```bash
cp .env.example .env
```
Then edit `.env` and fill in (from Supabase → **Project Settings → API**):
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

---

## Run

```bash
npm run dev
```
Open the printed URL (default http://localhost:5173).

### Verify it works
1. Click **Get started** → create an account (or **Continue with Google**).
2. If email confirmation is on, click the link in your inbox, then sign in.
3. Complete onboarding → you land on the dashboard with real, matched data.
4. Save an opportunity, then reload / open in another browser signed in as the
   same user — it persists (it's in Supabase, not localStorage).
5. In the Supabase dashboard → **Table Editor**, confirm rows appear in
   `profiles`, `saved_opportunities`, `conversations`, etc.

### Build / preview production
```bash
npm run build     # outputs to dist/
npm run preview   # serves the production build locally
```

---

## Project structure (key additions)

```
supabase/
  schema.sql                     — tables + RLS + signup trigger (run first)
  seed-demo.sql                  — DEV-ONLY fabricated sample catalog (never run in production)
  migrations/002_opportunity_engine.sql — verification workflow, organizations,
                                    source registry, notifications (run after schema.sql)
  functions/ingest-opportunities/ — Phase 2 ingestion pipeline (Edge Function, opt-in)

src/
  lib/
    supabaseClient.js            — the single Supabase client (null if unconfigured)
    dataService.js               — all DB reads/writes (catalog, saved, requests, chats)
    mappers.js                   — snake_case row <-> camelCase app-shape mappers
    nexaContext.js               — now takes catalog arrays as params (no data import)

  context/
    AuthContext.jsx              — session, sign up/in/out, Google, reset, verify
    CatalogContext.jsx           — published opportunities + mentors (RLS-scoped)
    OrganizationContext.jsx      — signed-in user's organization account + own listings
    ProfileContext.jsx           — per-user profile row (Supabase-backed)
    SavedContext.jsx             — per-user saved opportunities
    ConnectionsContext.jsx       — per-user connection requests
    ConversationsContext.jsx     — per-user NEXA conversations + messages

  components/
    auth/
      AuthLayout.jsx             — shared animated auth card + fields + Google button
      ProtectedRoute.jsx         — gates product routes behind auth
    motion/
      PageTransition.jsx         — per-route fade/rise transition

  pages/
    Login.jsx, Signup.jsx, ResetPassword.jsx,
    UpdatePassword.jsx, AuthCallback.jsx   — the auth flow
```

## Routes

| Path | Access | Page |
|---|---|---|
| `/` | public | Landing |
| `/login`, `/signup` | public | Auth |
| `/reset-password`, `/auth/update-password` | public | Password reset flow |
| `/auth/callback` | public | OAuth / email-verify landing |
| `/onboarding`, `/analysis` | protected | Onboarding flow |
| `/dashboard`, `/profile` | protected | Home + profile |
| `/discover`, `/discover/:id`, `/saved` | protected | Opportunities |
| `/network`, `/network/:id`, `/network/connections` | protected | Mentor network |
| `/nexa` | protected | AI assistant |
| `/org/signup`, `/org/dashboard` | protected | Organization account + listing management |
| `/admin/opportunities`, `/admin/organizations`, `/admin/sources` | admin only | Catalog, org verification, ingestion registry |

---

## Data model (Supabase)

| Table | Holds | Access |
|---|---|---|
| `profiles` | onboarding answers, roadmap, per user | own row only (RLS) |
| `opportunities` | catalog, admin-curated + org-submitted + ingested | published rows readable by all; drafts/pending readable only by their owner/admin |
| `organizations` | real-org accounts that submit/manage listings | readable by all; writable by owner/admin |
| `opportunity_sources` | Phase 2 ingestion registry | admin only |
| `opportunity_ingestion_log` | ingestion run history | admin only (read) |
| `notifications` / `notification_preferences` | per-user alerts (foundation, no writer job yet) | own rows only |
| `mentors` | public mentor directory | read-only to all |
| `saved_opportunities` | saved items + status, per user | own rows only |
| `connection_requests` | mentorship requests sent, per user | own rows only |
| `conversations` / `messages` | NEXA chat history, per user | own rows only |

A profile row is created automatically on signup by a Postgres trigger
(`handle_new_user`), so `profiles` always stays in sync with `auth.users`.

---

## Opportunity Engine

This is the real, database-backed system behind the opportunities catalog —
not a mock. There is no fabricated data in the production path: a fresh
production database starts with **zero** opportunities, and the UI ("We're
building your opportunity feed") is designed to look good that way.

### Phase 1 — curation

Admins add real opportunities at `/admin/opportunities`. Every listing has a
`verificationStatus` (`DRAFT → PENDING_REVIEW → VERIFIED/PUBLISHED`, or
`REJECTED`/`EXPIRED`) and provenance fields (`sourceType`, `sourceName`,
`sourceUrl`, `submittedBy`, `verifiedBy`, `lastVerifiedAt`). Admin-authored
listings publish immediately (an admin is the trust anchor); everything else
goes through review. **None of this is enforced only in the UI** — a Postgres
trigger (`protect_opportunity_verification` in
`002_opportunity_engine.sql`) silently downgrades any non-admin attempt to
set `VERIFIED`/`PUBLISHED` back to `PENDING_REVIEW`, so the rule holds even
if someone calls the API directly.

### Phase 2 — automated ingestion

`supabase/functions/ingest-opportunities/` is a real, deployable pipeline —
fetch → normalize → validate → dedupe → store as `PENDING_REVIEW`. It never
auto-publishes. What's actually implemented:

- **A source registry** (`/admin/sources`) — add a source's name, feed/API
  URL, type, and trust level. Nothing runs until you add a source *and*
  enable it.
- **One real adapter: RSS/Atom** (`adapters/rss.ts`). RSS is the one
  ingestion method that's generically safe to ship — a feed is content its
  publisher built for syndication, unlike scraping an arbitrary page. It
  extracts only what RSS standardizes (title, link, summary) and leaves
  deadline/funding/eligibility `null` — most feeds don't carry that as
  structured data, and this pipeline does not invent it.
- **Deduplication** (`dedupe.ts`) by normalized application URL, falling back
  to normalized (organization, title).
- **Source health tracking** — `last_checked_at`, `last_success_at`,
  `last_error`, and a run log, visible at `/admin/sources`.

**What you still have to do** (real-world constraint, not a UI mockup gap):
1. `supabase functions deploy ingest-opportunities --no-verify-jwt`
2. `supabase secrets set INGEST_SHARED_SECRET=<a random string>`
3. Add a schedule that POSTs to the function's URL with
   `Authorization: Bearer <that secret>` — either Supabase Dashboard →
   Edge Functions → Cron, or `pg_cron` + `pg_net` from the SQL editor.
4. Find and vet real sources yourself (check each one's robots.txt/ToS —
   the "method notes" field on each source in `/admin/sources` is where you
   record that you did), then add their real feed URLs.

There's no universal "get me all scholarships" API — the architecture
supports adding `API`/`DATASET` adapters later (implement the `Adapter`
interface in `adapters/types.ts`), but a generic HTML `WEB` scraper is
deliberately not included, since respecting a given site's terms is a
per-source decision, not something a generic scraper can do for you.

### Phase 3 & 4 — organizations

A real organization creates an account at `/org/signup`
(`organizations` table, `owner_id` = their `auth.users` row). New
organizations start `UNVERIFIED`. They can submit opportunities immediately
from `/org/dashboard` — every submission lands as `PENDING_REVIEW`
regardless of the organization's own verification status (enforced by the
`protect_opportunity_insert` trigger, not just the UI). An admin verifies
organizations at `/admin/organizations`; a verified organization still goes
through per-listing review — verification affects trust display, not
publishing rights. RLS (`opportunities_update_org_owner`,
`opportunities_insert_org_owner`) guarantees org A can never read or write
org B's listings.

### Phase 5 — matching & Nexa AI

The match engine (`src/lib/matching.js`) is deterministic — not AI, no
hallucination risk — and already existed in this codebase; it scores
category/goal/career-stage/skill overlap and explains its reasoning
(`src/lib/scoring.js`). `OpportunityCard`/`OpportunityDetail` show the score
and the "why" breakdown.

Nexa AI (`supabase/functions/nexa-chat`) is grounded in the **real,
published** catalog: `buildNexaContext()` (`src/lib/nexaContext.js`) now
filters to `verificationStatus === "PUBLISHED"` before anything is scored or
handed to the model, so an admin's or org's own unpublished drafts can never
leak into a recommendation. The system prompt
(`src/lib/nexaSystemPrompt.js`) explicitly forbids inventing a listing and
requires the literal fallback — *"I couldn't find a verified opportunity
matching those criteria right now."* — whenever nothing genuinely fits.

Notifications (`notifications` / `notification_preferences` tables) and
saved-opportunity status tracking (`SavedContext.jsx`, pre-existing) are the
foundation for "new match" / "deadline approaching" alerts — the tables and
RLS are in place; there's no scheduled job yet that actually writes rows
into `notifications` (that job would live alongside `ingest-opportunities`
as a second scheduled Edge Function; not built in this pass).

---

## Notes & limitations

- **Incoming ("received") connection requests** need a mentor-facing app that
  doesn't exist yet, so that list is genuinely empty until that's built — the
  previous fabricated inbound requests were removed. Requests you **send** are
  real rows in `connection_requests`.
- **In-app messaging** isn't built yet; the woman-detail page gives you
  conversation starters to copy.
- The NEXA assistant defaults to its deterministic demo mode; wire a real
  provider via the optional `VITE_NEXA_AI_*` vars (see `.env.example`) — but
  only through your own backend proxy in production.
- To regenerate `supabase/seed-demo.sql` from the bundled sample arrays:
  `node scripts/gen-seed.mjs`
- See "Opportunity Engine" above for Phases 1-5: verification workflow,
  organizations, ingestion, and Nexa AI grounding.

