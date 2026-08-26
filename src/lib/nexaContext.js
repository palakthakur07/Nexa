// Builds the structured context NEXA reasons over — concise on purpose
// (per the brief: "do not send unnecessary application data with every
// request"). This is pure data assembly, no UI, no network — the same
// object works whether it's fed to a real provider or the mock engine.
import { calculateMatchScore } from "./matching.js";
import { calculateMentorMatchScore } from "./mentorMatching.js";
import { getNextMove, generateRoadmap } from "./scoring.js";
import { generateRoadmap as generatePersonalizedRoadmap, attachRuntimeData } from "./roadmapEngine.js";

// `opportunities` and `mentors` are the live catalog arrays from
// CatalogContext (real Supabase data, or empty for mentors offline — see
// CatalogContext.jsx). Passing them in keeps this module free of any
// direct data-source import. `mentors` are real, self-registered people;
// this never recommends anyone who didn't register themselves.
export function buildNexaContext({ profile, saved, requests, entryContext, opportunities = [], mentors = [] }) {
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

  const roadmap = generateRoadmap(profile);
  const nextMove = getNextMove(profile);

  // Richer roadmap summary for "Ask NEXA about your roadmap" (phases,
  // progress, next best action) — kept separate from `roadmap` above since
  // that shape is still relied on by nexaMock's canned demo responses.
  const fullRoadmap = attachRuntimeData(generatePersonalizedRoadmap(profile), profile, OPPORTUNITIES);
  const personalizedRoadmap = {
    title: fullRoadmap.title,
    description: fullRoadmap.description,
    progress: fullRoadmap.progress,
    currentPhase: fullRoadmap.phases.find((p) => p.status === "in_progress")?.title || null,
    nextStep: fullRoadmap.nextAction ? { title: fullRoadmap.nextAction.title, description: fullRoadmap.nextAction.description, phase: fullRoadmap.nextAction.phaseTitle } : null,
    phases: fullRoadmap.phases.map((p) => ({ title: p.title, status: p.status, steps: p.steps.length })),
  };

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
    nextMove,
    personalizedRoadmap,
    recommendedMentors,
    // Real accepted connections only — a pending or declined request is
    // not "someone you're connected with".
    connections: (requests || []).filter((r) => r.status === "accepted").map((r) => ({ mentorId: r.mentor_id, topic: r.topic })),
    entryContext: entryContext || null,
  };
}
