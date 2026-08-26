// Builds the structured context NEXA reasons over — concise on purpose
// (per the brief: "do not send unnecessary application data with every
// request"). This is pure data assembly, no UI, no network — the same
// object works whether it's fed to a real provider or the mock engine.
import { calculateMatchScore } from "./matching.js";
import { calculateMentorMatchScore } from "./mentorMatching.js";
import { phaseStatus } from "./roadmapEngine.js";

// `opportunities` and `mentors` are the live catalog arrays from
// CatalogContext (real Supabase data, or empty for mentors offline — see
// CatalogContext.jsx). Passing them in keeps this module free of any
// direct data-source import. `mentors` are real, self-registered people;
// this never recommends anyone who didn't register themselves.
//
// `roadmapState` is the value from useRoadmap() — the user's real, persisted
// roadmap (or null if they haven't built one yet). Kept as its own param
// (not fetched here) so this stays pure data assembly, no context reads.
export function buildNexaContext({ profile, saved, requests, entryContext, opportunities = [], mentors = [], roadmapState = null }) {
  const OPPORTUNITIES = opportunities;
  const MENTORS = mentors;
  const savedOpportunities = Object.entries(saved || {}).map(([id, record]) => {
    const opportunity = OPPORTUNITIES.find((o) => o.id === id);
    if (!opportunity) return null;
    return { id, title: opportunity.title, status: record.status, match: calculateMatchScore(profile, opportunity) };
  }).filter(Boolean);

  const topOpportunities = [...OPPORTUNITIES]
    .map((o) => ({ id: o.id, title: o.title, match: calculateMatchScore(profile, o), deadline: o.deadline, funding: o.funding.type, categories: o.categories }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);

  // Genuinely empty when nobody has registered as a mentor yet — never
  // backfilled, so NEXA correctly says "I couldn't find a match" instead
  // of inventing someone.
  const recommendedMentors = [...MENTORS]
    .map((m) => ({ id: m.id, name: m.name, headline: m.headline, match: calculateMentorMatchScore(profile, m), canHelpWith: m.canHelpWith }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);

  // ---- Roadmap grounding ----
  // `roadmap` keeps the flat {label,status:"done"|"now"|"later"} shape the
  // demo-mode rules in nexaMock.js already understand, but it's now derived
  // from the user's real, persisted phase plan instead of a generic
  // onboarding checklist. `roadmapPlan` is the fuller structure (goal,
  // phases, progress) for a real AI provider to reason over directly.
  const rp = roadmapState?.roadmap || null;
  const flatSteps = rp ? rp.phases.flatMap((phase) =>
    phase.steps.map((step) => ({
      label: step.title,
      status: step.status === "completed" ? "done" : step.status === "in_progress" ? "now" : "later",
    }))
  ) : [];
  const roadmap = flatSteps;
  const nextStepInfo = roadmapState?.nextStep || null;
  const nextMove = nextStepInfo
    ? { title: nextStepInfo.step.title, why: nextStepInfo.step.description }
    : { title: rp ? "You've completed every step" : "Build your roadmap", why: rp ? "Update your goals to get a new plan." : "Tell NEXA what you're working toward on the Roadmap page and I'll build a personalized plan." };

  const roadmapPlan = rp ? {
    goal: rp.title,
    description: rp.description,
    progressPct: roadmapState.progress?.pct ?? 0,
    phases: rp.phases.map((phase) => ({
      title: phase.title,
      status: phaseStatus(phase),
      steps: phase.steps.map((s) => ({ title: s.title, status: s.status })),
    })),
  } : null;

  let currentOpportunity = null;
  let currentMentor = null;
  if (entryContext?.type === "opportunity") {
    const o = OPPORTUNITIES.find((x) => x.id === entryContext.id);
    if (o) currentOpportunity = { id: o.id, title: o.title, match: calculateMatchScore(profile, o), deadline: o.deadline, funding: o.funding.type, categories: o.categories, eligibility: o.eligibility };
  }
  if (entryContext?.type === "mentor") {
    const m = MENTORS.find((x) => x.id === entryContext.id);
    if (m) currentMentor = { id: m.id, name: m.name, headline: m.headline, match: calculateMentorMatchScore(profile, m), canHelpWith: m.canHelpWith, availability: m.availability };
  }

  return {
    user: {
      name: profile.name || null,
      careerStage: profile.careerStage || null,
      interests: profile.interests,
      goals: profile.goals,
      skills: profile.skills,
      priorities: profile.priorities,
      helpTopics: profile.helpTopics,
    },
    currentOpportunity,
    currentMentor,
    savedOpportunities,
    topOpportunities,
    roadmap,
    roadmapPlan,
    nextMove,
    recommendedMentors,
    // Real accepted connections only — a pending or declined request is
    // not "someone you're connected with".
    connections: (requests || []).filter((r) => r.status === "accepted").map((r) => ({ mentorId: r.mentor_id, topic: r.topic })),
    entryContext: entryContext || null,
  };
}
