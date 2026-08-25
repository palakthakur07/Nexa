// Deterministic matching engine for real, self-registered mentors —
// replaces the old lib/womanMatching.js, which scored against fields
// (relevantGoals, journeyTags, willingToHelpWith) that only ever existed
// on fabricated demo profiles. Same "no randomness, no AI" principle as
// lib/matching.js for opportunities; fields below all come from what a
// real mentor typed into the "Become a Mentor" form (topics, canHelpWith,
// skills, experience, languages, location, experienceLevel).
import { GOAL_TO_JOURNEY_TAG } from "../data/networkOptions.js";

function overlapScore(a, b) {
  if (!b || b.length === 0) return 50;
  if (!a || a.length === 0) return 40;
  const hits = a.filter((v) => b.includes(v)).length;
  return Math.min(100, (hits / b.length) * 100 + (hits > 0 ? 15 : 0));
}

function topicAlignment(profile, mentor) {
  const impliedTopics = (profile.goals || []).map((g) => GOAL_TO_JOURNEY_TAG[g]).filter(Boolean);
  if (impliedTopics.length === 0) return 45;
  return overlapScore(impliedTopics, mentor.topics);
}

function interestSkillAlignment(profile, mentor) {
  const userSignals = [...(profile.interests || []), ...(profile.skills || [])];
  const mentorSignals = [...(mentor.experience || []), ...(mentor.skills || [])];
  return overlapScore(userSignals, mentorSignals);
}

function careerStageRelevance(profile, mentor) {
  if (!profile.careerStage) return 50;
  const early = ["Student", "Early career", "Between opportunities"].includes(profile.careerStage);
  if (early) return mentor.experienceLevel === "Experienced" ? 90 : mentor.experienceLevel === "Mid-level" ? 70 : 55;
  return mentor.experienceLevel === "Experienced" ? 80 : 65;
}

function locationLanguageScore(profile, mentor) {
  const country = profile.location?.country?.trim().toLowerCase();
  let score = 55;
  const mentorLocation = (mentor.location || "").toLowerCase();
  if (country && mentorLocation.includes(country)) score = 85;
  else if (mentorLocation === "remote" || mentorLocation === "international") score = 70;
  if ((mentor.languages || []).includes("English")) score = Math.min(100, score + 10);
  return score;
}

function helpTopicAlignment(profile, mentor) {
  const priorityToHelp = {
    Mentorship: "Mentorship", "Career growth": "Career advice", Networking: "Networking",
    Learning: "Career advice", "Women-focused opportunities": "Mentorship",
  };
  const wanted = (profile.priorities || []).map((p) => priorityToHelp[p]).filter(Boolean);
  return overlapScore(wanted, mentor.canHelpWith);
}

export function calculateMentorMatchScore(profile, mentor) {
  const weighted =
    topicAlignment(profile, mentor) * 0.3 +
    interestSkillAlignment(profile, mentor) * 0.25 +
    careerStageRelevance(profile, mentor) * 0.15 +
    locationLanguageScore(profile, mentor) * 0.15 +
    helpTopicAlignment(profile, mentor) * 0.15;
  return Math.max(30, Math.min(99, Math.round(weighted)));
}

// Up to 4 short, evidence-based reasons — never fabricated, every line
// traces back to an actual overlap between the user's real profile and
// the mentor's real self-description.
export function getMentorMatchReasons(profile, mentor) {
  const reasons = [];
  const impliedTopics = (profile.goals || []).map((g) => GOAL_TO_JOURNEY_TAG[g]).filter(Boolean);
  const topicHit = impliedTopics.find((t) => (mentor.topics || []).includes(t));
  if (topicHit) reasons.push(`Their experience includes ${topicHit.toLowerCase()}`);

  const interestHit = (profile.interests || []).find((i) => (mentor.experience || []).includes(i));
  if (interestHit && reasons.length < 4) reasons.push(`They work in ${interestHit}, which you're exploring`);

  const skillHit = (profile.skills || []).find((s) => (mentor.skills || []).includes(s));
  if (skillHit && reasons.length < 4) reasons.push(`They have hands-on experience with ${skillHit}`);

  if (reasons.length < 4 && (mentor.canHelpWith || []).length > 0) {
    reasons.push(`Can help with ${mentor.canHelpWith[0].toLowerCase()}`);
  }
  if (reasons.length === 0) reasons.push("Broadly relevant based on what you've shared with NEXA so far");
  return reasons.slice(0, 4);
}
