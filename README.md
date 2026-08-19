# NEXA

## Phase 2 — personalization experience

Landing → onboarding → analysis → personalized dashboard → profile, built
as a real multi-page app with React Router and `localStorage`-backed
profile state. Phase 1's hero (3D floating-screen scene) and story sections
are unchanged, now living under `src/components/hero/` and
`src/components/landing/`.

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

  data/                     — mock data layer (swap for real API/DB later)
    opportunities.js
    women.js
    communities.js
    roadmap.js
    onboardingOptions.js    — option lists shared by onboarding + profile

  lib/
    scoring.js              — calculateMatchScore / getNextMove / generateRoadmap
    hooks.jsx                — useReveal, Reveal, useCameraParallax

  components/
    ui/                     — Button, Badge, Avatar, Chip, SelectCard, MatchRing
    Character.jsx           — central character asset slot
    NavBar.jsx, Footer.jsx, NexaDrawer.jsx
    hero/                   — HeroScene, FloatingScreen, mini-screen contents
    landing/Sections.jsx    — Problem / Pillars / Nexa intelligence / Final CTA
    onboarding/             — OnboardingLayout, ProgressDots, Steps
    dashboard/              — DashboardSection, EmptyState

  pages/
    Landing.jsx              — /
    Onboarding.jsx            — /onboarding
    Analysis.jsx               — /analysis
    Dashboard.jsx              — /dashboard
    Profile.jsx                 — /profile
    PlaceholderRoute.jsx        — /discover, /people, /roadmap
```

## Routes

| Path | Page |
|---|---|
| `/` | Landing (hero 3D scene + story) |
| `/onboarding` | 7-step guided onboarding |
| `/analysis` | Simulated "NEXA is connecting the dots" transition |
| `/dashboard` | Personalized dashboard |
| `/profile` | Edit the profile NEXA uses |
| `/discover`, `/people`, `/roadmap` | Lightweight placeholders reached from the hero and story sections |

## State & persistence

`ProfileContext` holds one profile object (career stage, interests, goals,
skills, priorities, location, name, `onboardingComplete`) and writes it to
`localStorage` on every change, wrapped in try/catch so a private-browsing
or storage-full environment degrades to session-only state instead of
crashing. Refreshing mid-onboarding keeps your answers.

## Swapping in the real character asset

```jsx
<HeroScene characterSrc="/images/nexa-character.png" />
```

in `pages/Landing.jsx`. Use a transparent PNG/WebP around 300×480.

## What's mock data

Everything under `src/data/` is demo/placeholder content, plus the
deterministic (non-AI) scoring functions in `src/lib/scoring.js`. Replace
the data files with real API/DB calls later — nothing else needs to change
since components only depend on the shapes those files export.

## Known limitations

- No backend, no real authentication, no real AI — match scores and the
  analysis screen are deterministic/simulated, by design for this phase.
- Not yet QA'd across breakpoints in a live browser.
- The central character is still an illustrated placeholder — see above.
