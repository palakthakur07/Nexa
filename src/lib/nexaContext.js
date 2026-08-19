// Builds the structured context NEXA reasons over — concise on purpose
// (per the brief: "do not send unnecessary application data with every
// request"). This is pure data assembly, no UI, no network — the same
// object works whether it's fed to a real provider or the mock engine.
import { OPPORTUNITIES } from "../data/opportunities.js";
import { WOMEN } from "../data/women.js";
import { calculateMatchScore } from "./matching.js";
import { calculateWomanMatchScore } from "./womanMatching.js";
import { getNextMove, generateRoadmap } from "./scoring.js";

export function buildNexaContext({ profile, saved, connections, entryContext }) {
  const savedOpportunities = Object.entries(saved || {}).map(([id, record]) => {
    const opportunity = OPPORTUNITIES.find((o) => o.id === id);
    if (!opportunity) return null;
    return { id, title: opportunity.title, status: record.status, match: calculateMatchScore(profile, opportunity) };
  }).filter(Boolean);

  const topOpportunities = [...OPPORTUNITIES]
    .map((o) => ({ id: o.id, title: o.title, match: calculateMatchScore(profile, o), deadline: o.deadline, funding: o.funding.type, categories: o.categories }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);

  const recommendedWomen = [...WOMEN]
    .map((w) => ({ id: w.id, name: w.name, headline: w.headline, match: calculateWomanMatchScore(profile, w), canHelpWith: w.canHelpWith }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);

  const roadmap = generateRoadmap(profile);
  const nextMove = getNextMove(profile);

  let currentOpportunity = null;
  let currentWoman = null;
  if (entryContext?.type === "opportunity") {
    const o = OPPORTUNITIES.find((x) => x.id === entryContext.id);
    if (o) currentOpportunity = { id: o.id, title: o.title, match: calculateMatchScore(profile, o), deadline: o.deadline, funding: o.funding.type, categories: o.categories, eligibility: o.eligibility };
  }
  if (entryContext?.type === "woman") {
    const w = WOMEN.find((x) => x.id === entryContext.id);
    if (w) currentWoman = { id: w.id, name: w.name, headline: w.headline, match: calculateWomanMatchScore(profile, w), canHelpWith: w.canHelpWith, journey: w.journey, availability: w.availability };
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
    currentWoman,
    savedOpportunities,
    topOpportunities,
    roadmap,
    nextMove,
    recommendedWomen,
    connections: (connections || []).map((c) => ({ name: c.name, reason: c.reason })),
    entryContext: entryContext || null,
  };
}
