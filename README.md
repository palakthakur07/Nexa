# NEXA

## Phase 3 — Discover: personalized opportunity discovery + matching

Landing → onboarding → analysis → personalized dashboard → profile, plus
now a full opportunity discovery experience: search, filter, sort, a
deterministic match-scoring engine, opportunity detail pages, and a saved
list with application-status tracking. Everything from Phase 1 (hero 3D
scene) and Phase 2 (onboarding/dashboard/profile) is unchanged.

## Run it

```bash
npm install
npm run dev
```

`npm run build` produces a static production build in `dist/`.

## Project structure

```
index.html
src/
  main.jsx                  — entry point (BrowserRouter, token styles)
  App.jsx                   — route table + global providers
  styles/tokens.css         — design tokens (colors, type, radius, motion)
  index.css                 — Tailwind directives

  context/
    ProfileContext.jsx      — profile state + localStorage persistence
    NexaDrawerContext.jsx   — Nexa preview drawer open/close state
    SavedContext.jsx        — saved opportunities + application status, localStorage-backed

  data/                     — mock data layer (swap for real API/DB later)
    opportunities.js        — 18 opportunities, full schema (Phase 3)
    women.js
    communities.js
    roadmap.js
    onboardingOptions.js    — option lists shared by onboarding + profile + filters

  lib/
    matching.js             — calculateMatchScore / getMatchBreakdown / getMatchReasons (Phase 3)
    deadline.js              — daysLeft / deadlineStatus / deadlineBucket / formatDeadline (Phase 3)
    scoring.js                — getNextMove / generateRoadmap (roadmap-only, post Phase 3)
    hooks.jsx                  — useReveal, Reveal, useCameraParallax

  components/
    ui/                     — Button, Badge, Avatar, Chip, SelectCard, MatchRing
    Character.jsx           — central character asset slot
    NavBar.jsx, Footer.jsx, NexaDrawer.jsx
    hero/                   — HeroScene, FloatingScreen, mini-screen contents
    landing/Sections.jsx    — Problem / Pillars / Nexa intelligence / Final CTA
    onboarding/             — OnboardingLayout, ProgressDots, Steps
    dashboard/              — DashboardSection, EmptyState
    discover/                — MatchScore, MatchBreakdown, DeadlineBadge, SaveButton,
                                OpportunityCard, FeaturedOpportunity, OpportunitySearch,
                                SortControl, OpportunityFilters, DiscoverHeader,
                                EligibilitySection, ApplicationSteps

  pages/
    Landing.jsx              — /
    Onboarding.jsx            — /onboarding
    Analysis.jsx                — /analysis
    Dashboard.jsx                — /dashboard
    Profile.jsx                   — /profile
    Discover.jsx                   — /discover (Phase 3)
    OpportunityDetail.jsx           — /discover/:id (Phase 3)
    Saved.jsx                        — /saved (Phase 3)
    PlaceholderRoute.jsx              — /people, /roadmap
```

## Routes

| Path | Page |
|---|---|
| `/` | Landing (hero 3D scene + story) |
| `/onboarding` | 7-step guided onboarding |
| `/analysis` | Simulated "NEXA is connecting the dots" transition |
| `/dashboard` | Personalized dashboard |
| `/profile` | Edit the profile NEXA uses |
| `/discover` | Opportunity discovery — search, filter, sort, featured match |
| `/discover/:id` | Opportunity detail — match breakdown, eligibility, how to apply |
| `/saved` | Saved opportunities + application status tracker |
| `/people`, `/roadmap` | Lightweight placeholders |

## State & persistence

- `ProfileContext` — one profile object, `localStorage`-backed, wrapped in try/catch.
- `SavedContext` — `{ [opportunityId]: { status, savedAt } }`, also `localStorage`-backed.
Refreshing mid-onboarding or after saving opportunities keeps your state.

## The matching engine

`src/lib/matching.js` — `calculateMatchScore(profile, opportunity)` is a
deterministic weighted formula (career stage 20% · goals 25% · interests
20% · skills 15% · priorities 10% · location 5% · baseline 5%), plus
`getMatchBreakdown` (4-bar explanation) and `getMatchReasons` (up to 4
plain-language reasons). Dashboard and Discover both import from this one
file, so they never disagree with each other.

## Swapping in the real character asset

```jsx
<HeroScene characterSrc="/images/nexa-character.png" />
```

in `pages/Landing.jsx`. Use a transparent PNG/WebP around 300×480.

## What's mock data

Everything under `src/data/` plus the scoring functions in `src/lib/`.
Nothing is a real AI call or real API — see each file's header comment.

## Known limitations

- No backend, no real authentication, no real AI.
- Match scores and eligibility status are deterministic heuristics, by design for this phase.
- "Add to roadmap" on the opportunity detail page is a local UI confirmation only — not wired into the roadmap's generated state, to avoid restructuring Phase 2.
- Not yet QA'd across breakpoints in a live browser.
