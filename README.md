# NEXA — Phase 1

Interactive landing experience: hero as a real CSS 3D scene (perspective
camera, translate3d depth, mouse-driven camera parallax), the four-pillar
story, a Nexa intelligence preview, community and roadmap sections, and a
Nexa entry drawer. Built on the Phase 0 token system (colors, type, radius,
motion — all as CSS custom properties in `src/App.jsx`).

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static
production build in `dist/`.

## Project structure

```
index.html
src/
  main.jsx      — React entry point
  App.jsx       — the entire NEXA Phase 1 experience (single component tree)
  index.css     — Tailwind directives
tailwind.config.js
postcss.config.js
vite.config.js
package.json
```

Everything — design tokens, primitives (Button, Badge, Avatar…), the hero's
3D scene, and every section — currently lives in `src/App.jsx`. It was kept
as one file to match how it was designed and reviewed phase-by-phase; if
you're continuing development, the natural next step is splitting it into
`src/components/`, `src/sections/`, and `src/tokens.css`.

## Swapping in the real character asset

`src/App.jsx` exports a `Character` component near the top of the file. Right
now it falls back to an illustrated placeholder. To use a real asset:

```jsx
<HeroScene characterSrc="/images/nexa-character.png" ... />
```

passed down from `NexaLanding` at the bottom of the file. Use a transparent
PNG/WebP around 300×480 for the best fit with the existing frame.

## What's mock data

- Hero screen contents (94% match, ₹3.2L, "8 communities", roadmap %) —
  `buildScreens()` in `App.jsx`.
- The Nexa conversation preview — hardcoded in `NexaIntelligenceSection`.
- The three profile cards — the `women` array.
- `/discover`, `/people`, `/roadmap` are lightweight placeholder views (no
  router yet — see `NexaLanding`'s `view` state) rather than real routes.

## Known limitations

- No backend, no router, no persisted state.
- The central character is an illustrated placeholder — see above for the
  swap path.
- Not yet QA'd in a live browser across breakpoints; worth checking
  1440 / 1024 / 768 / 430px once running.
