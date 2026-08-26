// Deterministic roadmap engine. Same idea as lib/matching.js: no AI, no
// randomness — a given profile always produces the same roadmap, so the
// only thing that changes it is the person changing their own profile.
// Real, verified opportunities are attached by scoring the live catalog
// with the same calculateMatchScore() used everywhere else in NEXA — this
// file never invents an opportunity.
import {
  TRACKS,
  scholarshipTrack,
  earlyCareerTrack,
  careerChangeTrack,
  returningTrack,
  founderTrack,
  fundingTrack,
  growthTrack,
} from "../data/roadmapTemplates.js";
import { calculateMatchScore } from "./matching.js";

const TRACK_META = {
  [TRACKS.SCHOLARSHIP]: (g) => ({
    title: g.includes("Study abroad") ? "Study Abroad" : "Scholarship",
    description: "Your personalized path to funded study, built from your goals and profile.",
  }),
  [TRACKS.EARLY_CAREER]: () => ({
    title: "Early Career",
    description: "Your personalized path to your first internship or job.",
  }),
  [TRACKS.CAREER_CHANGE]: (g, interests) => ({
    title: interests[0] ? `Career Change — ${interests[0]}` : "Career Change",
    description: "Your personalized path to a successful career switch.",
  }),
  [TRACKS.RETURNING]: () => ({
    title: "Returning to Work",
    description: "Your personalized path back into the workforce, at your pace.",
  }),
  [TRACKS.FOUNDER]: () => ({
    title: "Aspiring Founder",
    description: "Your personalized path from idea to launch.",
  }),
  [TRACKS.FUNDING]: () => ({
    title: "Find Funding",
    description: "Your personalized path to funding that matches your goal.",
  }),
  [TRACKS.GROWTH]: (g, interests) => ({
    title: interests[0] ? `Growth — ${interests[0]}` : "Your Growth Plan",
    description: "Your personalized path to building skills, community, and momentum.",
  }),
};

// Priority order when a profile has multiple goals — the most directional
// goal wins so the roadmap stays coherent instead of averaging everything.
const GOAL_PRIORITY = [
  "Start a business",
  "Return to work",
  "Change careers",
  "Get my first job",
  "Find an internship",
  "Study abroad",
  "Get a scholarship",
  "Find funding",
  "Build my skills",
  "Find mentors",
  "Grow my network",
  "Something else",
];

function pickPrimaryGoal(goals = []) {
  for (const g of GOAL_PRIORITY) if (goals.includes(g)) return g;
  return null;
}

function pickTrack(goal) {
  switch (goal) {
    case "Get a scholarship":
    case "Study abroad":
      return TRACKS.SCHOLARSHIP;
    case "Find an internship":
    case "Get my first job":
      return TRACKS.EARLY_CAREER;
    case "Change careers":
      return TRACKS.CAREER_CHANGE;
    case "Return to work":
      return TRACKS.RETURNING;
    case "Start a business":
      return TRACKS.FOUNDER;
    case "Find funding":
      return TRACKS.FUNDING;
    default:
      return TRACKS.GROWTH;
  }
}

function buildRawPhases(track, profile) {
  const ctx = {
    interests: profile.interests || [],
    priorities: profile.priorities || [],
    skills: profile.skills || [],
    isStudent: profile.careerStage === "Student",
  };
  switch (track) {
    case TRACKS.SCHOLARSHIP: return scholarshipTrack(ctx);
    case TRACKS.EARLY_CAREER: return earlyCareerTrack(ctx);
    case TRACKS.CAREER_CHANGE: return careerChangeTrack(ctx);
    case TRACKS.RETURNING: return returningTrack(ctx);
    case TRACKS.FOUNDER: return founderTrack(ctx);
    case TRACKS.FUNDING: return fundingTrack(ctx);
    default: return growthTrack(ctx);
  }
}

// ---------- opportunity attachment (real catalog data only) ----------
function matchOpportunitiesForPhase(phaseSpec, profile, opportunities) {
  if (!phaseSpec.find?.phase || !opportunities?.length) return [];
  const { types, categories, goalsAny } = phaseSpec.find;
  let pool = opportunities;
  if (types?.length) pool = pool.filter((o) => types.includes(o.type));
  if (goalsAny?.length) {
    const byGoal = opportunities.filter((o) => o.goals?.some((g) => goalsAny.includes(g)));
    // Union goal-matched opportunities back in even if type filter excluded them,
    // since an explicit goal match is a strong enough signal on its own.
    pool = [...new Map([...pool, ...byGoal].map((o) => [o.id, o])).values()];
  }
  return pool
    .map((o) => ({ opportunity: o, match: calculateMatchScore(profile, o) }))
    .filter(({ opportunity, match }) => match >= 45 || (categories?.length && opportunity.categories?.some((c) => categories.includes(c))))
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);
}

// ---------- ids + step-state derivation ----------
function withIds(rawPhases) {
  return rawPhases.map((phase) => ({
    id: phase.key,
    title: phase.title,
    description: phase.description,
    find: phase.find || null,
    steps: phase.steps.filter(Boolean).map((step) => ({
      id: `${phase.key}:${step.key}`,
      title: step.title,
      description: step.description,
      effort: step.effort || null,
      completed: false,
      completedAt: null,
    })),
  }));
}

// Locked / Upcoming / In Progress / Completed — derived from which steps are
// marked complete, never stored redundantly, so it can never drift out of
// sync with the actual completion data.
function deriveStatuses(phases) {
  let pointerFound = false;
  return phases.map((phase, pIdx) => {
    const steps = phase.steps.map((step) => {
      let status;
      if (step.completed) status = "completed";
      else if (!pointerFound) { status = "in_progress"; pointerFound = true; }
      else status = "upcoming";
      return { ...step, status };
    });
    const allDone = steps.every((s) => s.completed);
    const anyActive = steps.some((s) => s.status === "in_progress");
    // A phase with no steps yet touched, sitting after the active phase,
    // reads as locked in the UI even though its own steps say "upcoming" —
    // keeps the timeline from showing five simultaneous "in progress" phases.
    const phaseStatus = allDone ? "completed" : anyActive ? "in_progress" : pIdx === 0 ? "upcoming" : "locked";
    return { ...phase, status: phaseStatus, steps: steps.map((s) => (phaseStatus === "locked" && s.status === "upcoming" ? { ...s, status: "locked" } : s)) };
  });
}

export function computeProgress(phases) {
  const allSteps = phases.flatMap((p) => p.steps);
  const completed = allSteps.filter((s) => s.completed).length;
  const total = allSteps.length;
  return { completed, total, pct: total ? Math.round((completed / total) * 100) : 0 };
}

export function getNextBestAction(phases) {
  for (const phase of phases) {
    const step = phase.steps.find((s) => s.status === "in_progress");
    if (step) return { phaseId: phase.id, phaseTitle: phase.title, stepId: step.id, title: step.title, description: step.description };
  }
  return null;
}

export function profileSignature(profile) {
  return {
    goal: pickPrimaryGoal(profile.goals),
    careerStage: profile.careerStage || null,
    interests: [...(profile.interests || [])].sort(),
    priorities: [...(profile.priorities || [])].sort(),
    customItemCount: (profile.customRoadmapItems || []).length,
  };
}

function signaturesDiffer(a, b) {
  if (!a || !b) return true;
  if (a.goal !== b.goal || a.careerStage !== b.careerStage) return true;
  if (JSON.stringify(a.interests) !== JSON.stringify(b.interests)) return true;
  if (JSON.stringify(a.priorities) !== JSON.stringify(b.priorities)) return true;
  if ((a.customItemCount || 0) !== (b.customItemCount || 0)) return true;
  return false;
}
export { signaturesDiffer };

// Builds a full roadmap (title/description/phases with ids, no statuses/
// opportunities attached yet — see attachRuntimeData) from the profile
// alone. Pure and synchronous.
export function generateRoadmap(profile) {
  const goal = pickPrimaryGoal(profile.goals);
  const track = pickTrack(goal);
  const meta = TRACK_META[track](profile.goals || [], profile.interests || []);
  const rawPhases = buildRawPhases(track, profile);

  // Fold in ad-hoc items added elsewhere in NEXA ("Add to roadmap" on an
  // opportunity, or NEXA chat's ADD_TO_ROADMAP action) as a trailing phase,
  // so they stay visible instead of disappearing now that the roadmap is a
  // real feature instead of the old flat checklist.
  if (profile.customRoadmapItems?.length) {
    rawPhases.push({
      key: "your-additions",
      title: "Your Additions",
      description: "Steps you added yourself from opportunities or NEXA chat.",
      steps: profile.customRoadmapItems.map((label, i) => ({
        key: `custom-${i}`,
        title: label,
        description: "Added by you.",
        effort: null,
      })),
    });
  }

  return {
    goal,
    track,
    title: meta.title,
    description: meta.description,
    phases: withIds(rawPhases),
  };
}

// Attaches derived status + live opportunity matches. Split from
// generateRoadmap() so a freshly-loaded roadmap (with persisted `completed`
// flags from the database) and a freshly-generated one go through the exact
// same status/opportunity logic.
export function attachRuntimeData(roadmap, profile, opportunities) {
  const phasesWithOpportunities = roadmap.phases.map((phase) => ({
    ...phase,
    opportunities: matchOpportunitiesForPhase(phase, profile, opportunities).map(({ opportunity, match }) => ({ id: opportunity.id, match })),
  }));
  const phases = deriveStatuses(phasesWithOpportunities);
  return { ...roadmap, phases, progress: computeProgress(phases), nextAction: getNextBestAction(phases) };
}

// Regeneration (goal/profile changed): keep completion state for any step
// whose id survives into the new roadmap, so switching a goal never silently
// wipes progress the person already made (section 13/25).
export function mergeCompletion(newRoadmap, oldPhases = []) {
  const oldById = new Map();
  oldPhases.forEach((p) => p.steps.forEach((s) => oldById.set(s.id, s)));
  const phases = newRoadmap.phases.map((phase) => ({
    ...phase,
    steps: phase.steps.map((step) => {
      const prior = oldById.get(step.id);
      return prior?.completed ? { ...step, completed: true, completedAt: prior.completedAt || new Date().toISOString() } : step;
    }),
  }));
  return { ...newRoadmap, phases };
}
