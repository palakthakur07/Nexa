// Roadmap/next-move derivation logic. Opportunity match scoring now lives
// in lib/matching.js (Phase 3) — this file kept its two roadmap-related
// functions since they're about the user's journey, not opportunity data.
import { ROADMAP_TEMPLATE } from "../data/roadmap.js";

export function getNextMove(profile) {
  if (profile.goals.includes("Study abroad") && profile.priorities.includes("Funding")) {
    return { title: "Complete your scholarship profile", why: "You've told NEXA you're interested in studying abroad and funding is a priority." };
  }
  if (profile.goals.includes("Find funding")) {
    return { title: "Explore funding options matched to you", why: "Funding is one of the things you told NEXA you're looking for." };
  }
  if (profile.goals.includes("Find mentors") || profile.priorities.includes("Mentorship")) {
    return { title: "Meet a woman who's been there", why: "Mentorship is something NEXA can help with right away." };
  }
  if (profile.skills.length === 0) {
    return { title: "Add your skills to sharpen your matches", why: "NEXA uses your skills to fine-tune opportunity matches." };
  }
  return { title: "Explore your first opportunity", why: "Based on what you've told NEXA so far." };
}

export function generateRoadmap(profile) {
  const filledCount = [
    profile.careerStage,
    profile.goals.length > 0,
    profile.interests.length > 0,
    profile.skills.length > 0,
    profile.priorities.length > 0,
  ].filter(Boolean).length;

  return ROADMAP_TEMPLATE.map((label, i) => ({
    label,
    status: i < filledCount ? "done" : i === filledCount ? "now" : "later",
  }));
}
