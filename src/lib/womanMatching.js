// Deterministic matching engine for the women network — intentionally
// separate from lib/matching.js (opportunities). Same "no randomness, no
// AI" principle, different weighting since journey/experience matters more
// here than a funding preference does.
// Weights: goal alignment 25% · journey alignment 25% · interest/skill
// alignment 20% · career-stage relevance 10% · location/language 10% ·
// help-topic alignment 10%.
import { GOAL_TO_JOURNEY_TAG } from "../data/networkOptions.js";

function overlapScore(a, b) {
  if (!b || b.length === 0) return 50;
  if (!a || a.length === 0) return 40;
  const hits = a.filter((v) => b.includes(v)).length;
  return Math.min(100, (hits / b.length) * 100 + (hits > 0 ? 15 : 0));
}

function goalAlignment(profile, woman) {
  return overlapScore(profile.goals, woman.relevantGoals);
}

function journeyAlignment(profile, woman) {
  const impliedTags = (profile.goals || []).map((g) => GOAL_TO_JOURNEY_TAG[g]).filter(Boolean);
  if (impliedTags.length === 0) return 45;
  return overlapScore(impliedTags, woman.journeyTags);
}

function interestSkillAlignment(profile, woman) {
  const userSignals = [...(profile.interests || []), ...(profile.skills || [])];
  const womanSignals = [...(woman.experience || []), ...(woman.skills || [])];
  return overlapScore(userSignals, womanSignals);
}

function careerStageRelevance(profile, woman) {
  if (!profile.careerStage) return 50;
  const early = ["Student", "Early career", "Between opportunities"].includes(profile.careerStage);
  if (early) return woman.experienceLevel === "Experienced" ? 90 : woman.experienceLevel === "Mid-level" ? 70 : 55;
  return woman.experienceLevel === "Experienced" ? 80 : 65;
}

function locationLanguageScore(profile, woman) {
  const country = profile.location?.country?.trim().toLowerCase();
  let score = 55;
  if (country && woman.location.toLowerCase().includes(country)) score = 85;
  else if (woman.location === "Remote" || woman.location === "International") score = 70;
  if (woman.languages.includes("English")) score = Math.min(100, score + 10);
  return score;
}

function helpTopicAlignment(profile, woman) {
  const priorityToHelp = {
    Mentorship: "Mentorship", "Career growth": "Career advice", Networking: "Networking",
    Learning: "Career advice", "Women-focused opportunities": "Mentorship",
  };
  const wanted = (profile.priorities || []).map((p) => priorityToHelp[p]).filter(Boolean);
  return overlapScore(wanted, woman.willingToHelpWith);
}

export function calculateWomanMatchScore(profile, woman) {
  const weighted =
    goalAlignment(profile, woman) * 0.25 +
    journeyAlignment(profile, woman) * 0.25 +
    interestSkillAlignment(profile, woman) * 0.2 +
    careerStageRelevance(profile, woman) * 0.1 +
    locationLanguageScore(profile, woman) * 0.1 +
    helpTopicAlignment(profile, woman) * 0.1;
  return Math.max(30, Math.min(99, Math.round(weighted)));
}

// Up to 4 short, evidence-based reasons — never fabricated.
export function getWomanMatchReasons(profile, woman) {
  const reasons = [];
  const goalHit = (profile.goals || []).find((g) => woman.relevantGoals.includes(g));
  if (goalHit) reasons.push(`She has direct experience with your goal to ${goalHit.toLowerCase()}`);

  const impliedTags = (profile.goals || []).map((g) => GOAL_TO_JOURNEY_TAG[g]).filter(Boolean);
  const journeyHit = impliedTags.find((t) => woman.journeyTags.includes(t));
  if (journeyHit && reasons.length < 4) reasons.push(`Her journey included ${journeyHit.toLowerCase()}`);

  const interestHit = (profile.interests || []).find((i) => woman.experience.includes(i));
  if (interestHit && reasons.length < 4) reasons.push(`She works in ${interestHit}, which you're exploring`);

  const skillHit = (profile.skills || []).find((s) => woman.skills.includes(s));
  if (skillHit && reasons.length < 4) reasons.push(`She has hands-on experience with ${skillHit}`);

  if (reasons.length < 4 && woman.canHelpWith.length > 0) {
    reasons.push(`Can help with ${woman.canHelpWith[0].toLowerCase()}`);
  }
  if (reasons.length === 0) reasons.push("Broadly relevant based on what you've shared with NEXA so far");
  return reasons.slice(0, 4);
}
