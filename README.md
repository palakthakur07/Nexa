# NEXA

## Phase 5 — the NEXA AI assistant

Landing → onboarding → dashboard → discover → network → **NEXA** (Phase 5):
a full-screen, context-aware assistant with conversation history, a
dynamic context panel, structured/actionable responses, and a deterministic
demo mode that works with zero configuration. Phases 1–4 are unchanged
except for the "Ask Nexa" entry points, which now open `/nexa` with
context instead of a small preview drawer, and one pre-existing bug fix
(see below).

## Run it

```bash
npm install
npm run dev
```

## Project structure (additions since Phase 4)

```
src/
  context/
    ConversationsContext.jsx    — multiple conversations, localStorage-backed, auto-titled

  lib/
    nexaContext.js               — buildNexaContext(): assembles the structured context object
    nexaAIService.js             — askNexa(): provider abstraction + automatic demo-mode fallback
    nexaSystemPrompt.js          — system instruction used only if a real provider is configured
    nexaMock.js                  — deterministic "NEXA demo mode" reasoning engine
    suggestedPrompts.js          — profile/context-aware suggested prompt generator
    markdownLite.jsx             — safe, minimal formatter (bold/bullets/numbered/line breaks)

  components/
    nexa/
      ConversationSidebar.jsx, ContextPanel.jsx, WelcomeState.jsx, NexaOrb.jsx
      MessageComposer.jsx, UserMessage.jsx, NexaMessage.jsx, ActionCard.jsx
      SuggestionChip.jsx, TypingIndicator.jsx

  pages/
    Nexa.jsx                     — /nexa
```

## Routes

| Path | Page |
|---|---|
| `/nexa` | Full-screen assistant: conversation sidebar (desktop) / drawer (mobile), chat, dynamic context panel |

Entry points that open `/nexa` with context: Dashboard's "Ask Nexa", Discover's featured-opportunity "Ask NEXA about this", the Opportunity Detail page, Network's "Ask NEXA who I should talk to", a Woman Detail profile, the Profile page's "Ask NEXA about my next step", and a persistent sparkle icon in the nav bar (no context).

## AI provider

**None is configured by default.** `lib/nexaAIService.js` reads
`VITE_NEXA_AI_API_KEY` (see `.env.example`) — if unset, which is the
default, NEXA runs entirely in demo mode. If set, it attempts an
OpenAI-chat-completions-style call and **automatically falls back to demo
mode** on any failure, so a bad key or network error never breaks the UI.

**Security note:** any key placed in `VITE_NEXA_AI_API_KEY` ships inside
client-side JavaScript — visible to anyone with dev tools open. This path
exists for local experimentation only. For a real deployment, replace
`callRealProvider()` in `nexaAIService.js` with a call to your own
backend/proxy that holds the key server-side.

## Environment variables

All optional (see `.env.example`):
- `VITE_NEXA_AI_API_KEY`
- `VITE_NEXA_AI_BASE_URL` (defaults to OpenAI's chat completions endpoint)
- `VITE_NEXA_AI_MODEL` (defaults to `gpt-4o-mini`)

## Mock fallback behavior ("NEXA demo mode")

`lib/nexaMock.js` pattern-matches the user's message against the live
context object and returns a grounded, structured response — never a
generic "this is a demo response." Covers: next step, prioritizing among
matched opportunities (including "fully funded" / "closes soonest"
filters), eligibility review, comparing saved opportunities, network
recommendations ("who should I talk to"), roadmap status and 30-day
planning, profile strengths/gaps, and basic application-writing guidance
(essay/SOP/email — structural help, not a finished document). A small
"Demo mode" indicator shows in the context panel whenever no provider is
configured.

## Real actions, not fake links

NEXA's action cards perform real state changes: `SAVE_OPPORTUNITY` calls
the same `SavedContext` Discover uses; `ADD_TO_ROADMAP` calls a new
`addRoadmapItem()` on `ProfileContext` (additive — appends to the
auto-generated roadmap from `lib/scoring.js`, never replaces it);
`OPEN_*` actions navigate with React Router. Every action shows an
explicit confirmation ("Added to your roadmap.") rather than silently
mutating state.

## A pre-existing bug fixed in this phase

`components/hero/screens.config.js` (from Phase 3) contained JSX but had a
`.js` extension — Vite's default esbuild config does not parse JSX in
`.js` files, so this would have failed a real build. Renamed to
`screens.config.jsx` and the one import in `HeroScene.jsx` updated to
match. Caught by re-validating the whole project during this phase.

## Known limitations

- Demo mode is the only fully-tested path in this environment (no real API key available here).
- The real-provider path returns plain text only — no structured actions from a live model yet (that contract would be a good Phase 6 addition).
- Conversation history persists via `localStorage`, per-browser only.
- Not yet QA'd across breakpoints in a live browser.
