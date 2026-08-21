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
3. Open another **New query**, paste [`supabase/seed.sql`](supabase/seed.sql), and **Run**.
   - This loads the opportunities and mentors catalogs.

> Both files are safe to re-run — they use `create ... if not exists` and
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
  seed.sql                       — opportunities + mentors catalog (run second)

src/
  lib/
    supabaseClient.js            — the single Supabase client (null if unconfigured)
    dataService.js               — all DB reads/writes (catalog, saved, requests, chats)
    mappers.js                   — snake_case row <-> camelCase app-shape mappers
    nexaContext.js               — now takes catalog arrays as params (no data import)

  context/
    AuthContext.jsx              — session, sign up/in/out, Google, reset, verify
    CatalogContext.jsx           — opportunities + mentors from Supabase (or fallback)
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

---

## Data model (Supabase)

| Table | Holds | Access |
|---|---|---|
| `profiles` | onboarding answers, roadmap, per user | own row only (RLS) |
| `opportunities` | public catalog | read-only to all |
| `mentors` | public mentor directory | read-only to all |
| `saved_opportunities` | saved items + status, per user | own rows only |
| `connection_requests` | mentorship requests sent, per user | own rows only |
| `conversations` / `messages` | NEXA chat history, per user | own rows only |

A profile row is created automatically on signup by a Postgres trigger
(`handle_new_user`), so `profiles` always stays in sync with `auth.users`.

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
- To regenerate `supabase/seed.sql` from the bundled sample arrays:
  `node scripts/.gen-seed.mjs`

