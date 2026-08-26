// Roadmap generation + progress logic. Deterministic, like matching.js and
// scoring.js — the same profile always produces the same fresh plan, and
// progress is always computed from actual step statuses, never stored as a
// bare number. This is the one place that understands the roadmap's shape.
import { TEMPLATES, pickTemplateKey } from "../data/roadmapTemplates.js";

// A fingerprint of the profile fields a roadmap was generated from, so we
// can tell later whether the profile has meaningfully changed (goals,
// career stage, or interests) and the roadmap might be stale.
export function fingerprintProfile(profile) {
  return {
    goals: [...(profile.goals || [])].sort(),
    careerStage: profile.careerStage || "",
    interests: [...(profile.interests || [])].sort(),
  };
}

function sameFingerprint(a, b) {
  if (!a || !b) return false;
  return (
    JSON.stringify(a.goals) === JSON.stringify(b.goals) &&
    a.careerStage === b.careerStage &&
    JSON.stringify(a.interests) === JSON.stringify(b.interests)
  );
}

// Every step starts "upcoming" except the very first incomplete step overall,
// which becomes "in_progress" — this is also what makes step 1 of phase 1
// the initial "next best action" for a freshly generated roadmap.
function freshPhases(templatePhases) {
  const phases = templatePhases.map((phase) => ({
    id: phase.id,
    title: phase.title,
    description: phase.description,
    resourceFocus: phase.resourceFocus || null,
    steps: phase.steps.map((s) => ({ ...s, status: "upcoming", completedAt: null })),
  }));
  return recomputeStatuses(phases);
}

// Ensures exactly one step is "in_progress" at a time: the earliest
// non-completed step across all phases in order. Everything else that
// isn't completed is "upcoming". This is what drives "Your next step".
export function recomputeStatuses(phases) {
  let foundInProgress = false;
  return phases.map((phase) => ({
    ...phase,
    steps: phase.steps.map((step) => {
      if (step.status === "completed") return step;
      if (!foundInProgress) {
        foundInProgress = true;
        return { ...step, status: "in_progress" };
      }
      return { ...step, status: "upcoming" };
    }),
  }));
}

export function generateRoadmapPlan(profile) {
  const goalKey = pickTemplateKey(profile);
  const template = TEMPLATES[goalKey] || TEMPLATES.general;
  const built = template.build(profile);
  return {
    goalKey,
    title: built.title,
    description: built.description,
    phases: freshPhases(built.phases),
    sourceSnapshot: fingerprintProfile(profile),
  };
}

// Regenerating from a changed profile shouldn't silently erase progress.
// Any step whose id still exists in the new template keeps its old
// "completed" status; brand-new steps start fresh. Statuses are then
// recomputed so exactly one step is "in_progress" again.
export function regenerateRoadmapPlan(profile, previousPhases) {
  const fresh = generateRoadmapPlan(profile);
  const oldById = new Map();
  (previousPhases || []).forEach((phase) => {
    (phase.steps || []).forEach((step) => oldById.set(step.id, step));
  });
  const merged = fresh.phases.map((phase) => ({
    ...phase,
    steps: phase.steps.map((step) => {
      const old = oldById.get(step.id);
      if (old && old.status === "completed") {
        return { ...step, status: "completed", completedAt: old.completedAt };
      }
      return step;
    }),
  }));
  return { ...fresh, phases: recomputeStatuses(merged) };
}

export function isStale(profile, sourceSnapshot) {
  return !sameFingerprint(fingerprintProfile(profile), sourceSnapshot);
}

export function computeProgress(phases) {
  let total = 0;
  let completed = 0;
  (phases || []).forEach((phase) => {
    (phase.steps || []).forEach((step) => {
      total += 1;
      if (step.status === "completed") completed += 1;
    });
  });
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, pct };
}

// Phase-level status, derived — never stored. "locked" is purely visual:
// a phase whose steps haven't been reached yet. Users can still complete
// steps out of order (see toggleStepStatus) — this only affects display.
export function phaseStatus(phase) {
  const steps = phase.steps || [];
  if (steps.length === 0) return "upcoming";
  if (steps.every((s) => s.status === "completed")) return "completed";
  if (steps.some((s) => s.status === "completed" || s.status === "in_progress")) return "in_progress";
  return "locked";
}

// The single most relevant action right now — the earliest in_progress
// step, found by walking phases/steps in order.
export function getNextStep(phases) {
  for (const phase of phases || []) {
    for (const step of phase.steps || []) {
      if (step.status === "in_progress") return { phase, step };
    }
  }
  return null;
}

export function toggleStepStatus(phases, phaseId, stepId) {
  const next = (phases || []).map((phase) => {
    if (phase.id !== phaseId) return phase;
    return {
      ...phase,
      steps: phase.steps.map((step) => {
        if (step.id !== stepId) return step;
        const nowCompleted = step.status !== "completed";
        return { ...step, status: nowCompleted ? "completed" : "upcoming", completedAt: nowCompleted ? new Date().toISOString() : null };
      }),
    };
  });
  return recomputeStatuses(next);
}
