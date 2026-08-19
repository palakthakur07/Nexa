// Deterministic opportunity-matching engine. No AI, no randomness — the
// same profile + opportunity pair always produces the same score, so
// changing the profile is the only thing that moves recommendations.
// Weights: career stage 20% · goals 25% · interests 20% · skills 15% ·
// priorities 10% · location 5% · baseline 5%.

function overlapScore(profileList, oppList) {
  if (!oppList || oppList.length === 0) return 50; // opportunity doesn't specify — neutral
  if (!profileList || profileList.length === 0) return 40; // user hasn't told NEXA yet — slightly below neutral
  const hits = profileList.filter((v) => oppList.includes(v)).length;
  return Math.min(100, (hits / oppList.length) * 100 + (hits > 0 ? 15 : 0));
}

function careerStageScore(profile, opp) {
  if (!profile.careerStage) return 40;
  return opp.careerStages.includes(profile.careerStage) ? 100 : 25;
}

function prioritiesScore(profile, opp) {
  if (!profile.priorities || profile.priorities.length === 0) return 50;
  let hits = 0;
  profile.priorities.forEach((p) => {
    if (p === "Funding" && ["Fully funded", "Partially funded", "Paid"].includes(opp.funding.type)) hits += 1;
    else if (p === "Flexibility" && opp.remote) hits += 1;
    else if (p === "Location" && opp.remote) hits += 1;
    else if (p === "Women-focused opportunities" && opp.categories.includes("Women in Tech")) hits += 1;
    else if (p === "Mentorship" && opp.type === "Mentorship") hits += 1;
    else if (p === "Networking" && ["Incubator", "Leadership"].includes(opp.type)) hits += 1;
    else if (p === "Career growth" && ["Leadership", "Fellowship"].includes(opp.type)) hits += 1;
    else if (p === "Prestige" && opp.verified) hits += 1;
    else if (p === "Learning" && ["Internship", "Fellowship"].includes(opp.type)) hits += 1;
    else if (p === "Speed" && opp.type === "Competition") hits += 1;
  });
  return Math.min(100, (hits / profile.priorities.length) * 100 + 15);
}

function locationScore(profile, opp) {
  const relocate = profile.location?.openToRelocation;
  if (!relocate) return 55;
  if (opp.remote) return 100;
  if (relocate === "Online only") return 20;
  if (relocate === "Yes") return 85;
  // relocate === "No": prefer opportunities in their own country
  const country = profile.location?.country?.trim().toLowerCase();
  if (country && opp.location.toLowerCase().includes(country)) return 90;
  return 35;
}

export function calculateMatchScore(profile, opp) {
  const weighted =
    careerStageScore(profile, opp) * 0.2 +
    overlapScore(profile.goals, opp.goals) * 0.25 +
    overlapScore(profile.interests, opp.categories) * 0.2 +
    overlapScore(profile.skills, opp.skills) * 0.15 +
    prioritiesScore(profile, opp) * 0.1 +
    locationScore(profile, opp) * 0.05 +
    60 * 0.05; // small constant so baseline compatibility is never near zero
  return Math.max(30, Math.min(99, Math.round(weighted)));
}

// Four-bar breakdown shown on the detail page and featured card.
export function getMatchBreakdown(profile, opp) {
  return [
    { label: "Goal alignment", value: Math.round(overlapScore(profile.goals, opp.goals)) },
    { label: "Interest alignment", value: Math.round(overlapScore(profile.interests, opp.categories)) },
    { label: "Skills alignment", value: Math.round(overlapScore(profile.skills, opp.skills)) },
    { label: "Funding preference", value: Math.round(prioritiesScore(profile, opp)) },
  ];
}

// Short, human-readable reasons — never more than 4, never fabricated
// beyond what the profile/opportunity data actually supports.
export function getMatchReasons(profile, opp) {
  const reasons = [];
  const goalHit = profile.goals.find((g) => opp.goals.includes(g));
  if (goalHit) reasons.push(`Supports your goal to ${goalHit.toLowerCase()}`);

  const interestHit = profile.interests.find((i) => opp.categories.includes(i));
  if (interestHit) reasons.push(`Matches your interest in ${interestHit}`);

  if (profile.careerStage && opp.careerStages.includes(profile.careerStage)) {
    reasons.push(`Suitable for your current career stage (${profile.careerStage})`);
  }

  if (profile.priorities.includes("Funding") && ["Fully funded", "Paid"].includes(opp.funding.type)) {
    reasons.push("Funding is one of your priorities, and this is " + opp.funding.type.toLowerCase());
  }

  const skillHit = profile.skills.find((s) => opp.skills.includes(s));
  if (skillHit && reasons.length < 4) reasons.push(`Values your ${skillHit} experience`);

  if (profile.priorities.includes("Women-focused opportunities") && opp.categories.includes("Women in Tech") && reasons.length < 4) {
    reasons.push("A women-focused opportunity, matching your priorities");
  }

  if (reasons.length === 0) {
    reasons.push("Broadly relevant to the goals and interests you've shared with NEXA so far");
  }
  return reasons.slice(0, 4);
}
