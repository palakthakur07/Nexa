# NEXA

## Phase 4 — Women network: "women who've been there"

Landing → onboarding → dashboard → discover (Phase 3) → **network** (Phase 4):
structured matching to women with relevant experience, profile pages with a
journey timeline, a guided "ask for help" request flow, connections, and a
lightweight received/sent request inbox. Phases 1–3 are unchanged except for
two integration points (Dashboard's women section, Discover's new "someone
who's been there" card) and swapping the old `/people` placeholder for the
real `/network`.

## Run it

```bash
npm install
npm run dev
```

## Project structure (additions since Phase 3)

```
src/
  context/
    ConnectionsContext.jsx     — sent/received requests + connections, localStorage-backed

  data/
    women.js                   — 15 full demo profiles (Phase 4 schema)
    networkOptions.js          — experience/journey/help-type/language vocab, goal→journey-tag map

  lib/
    womanMatching.js           — calculateWomanMatchScore / getWomanMatchReasons (separate from lib/matching.js)

  components/
    network/
      WomanCard.jsx, WomanMatchScore.jsx, MatchExplanation.jsx, VerifiedBadge.jsx
      ConnectionStatus.jsx, JourneyTimeline.jsx, HelpRequestModal.jsx
      NetworkFilters.jsx, NetworkSearch.jsx, NetworkHero.jsx
      CommunitySuggestion.jsx, GiveBackCard.jsx, SomeoneWhosBeenThere.jsx

  pages/
    Network.jsx                — /network
    WomanDetail.jsx             — /network/:id
    Connections.jsx              — /network/connections
```

## Routes

| Path | Page |
|---|---|
| `/network` | Personalized hero + browsable, filterable, searchable women network |
| `/network/:id` | Woman profile — journey timeline, why she's recommended, ask for help |
| `/network/connections` | Connections + sent/received requests (accept/decline) |
| `/roadmap` | Remaining lightweight placeholder |

`/people` no longer exists — it's `/network` now (hero panels, pillar
"Connect", footer link, and nav all point there).

## The woman-matching engine

`src/lib/womanMatching.js` — deliberately separate from the opportunity
matching engine (`lib/matching.js`). Weights: goal alignment 25% · journey
alignment 25% · interest/skill alignment 20% · career-stage relevance 10% ·
location/language 10% · help-topic alignment 10%. `getWomanMatchReasons`
never states more than the profile/woman data actually supports.

## State & persistence

- `ConnectionsContext` — `{ sent[], received[], connections[] }`,
  `localStorage`-backed. Seeded once (first load only) with two demo
  "received" requests and one existing connection, since there's no backend
  to generate real incoming requests for a demo.
- `ProfileContext` gained two additive fields: `helpTopics` (what the user
  can help others with, edited on `/profile`) and `giveBack` (the "share
  your experience" form result). Both default to empty/`null` and don't
  touch any Phase 1–3 profile field.

## What's demo/mock

All 15 profiles in `data/women.js` are fictional. Every verification badge
reads "Demo verified" — never implying real-world identity verification.
Requests sent from the UI are stored locally only; nothing is transmitted
anywhere.

## Known limitations

- No real messaging — accepting a connection reveals conversation starters, not a working composer.
- Sent requests stay "Pending" indefinitely (no simulated auto-acceptance) since faking a real person's response would be misleading.
- Not yet QA'd across breakpoints in a live browser.
