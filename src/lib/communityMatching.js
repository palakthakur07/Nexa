// Deterministic community ranking — mirrors matching.js's approach.
// Same profile + community list always produces the same order, so the
// only thing that moves the "Communities" card is the user's own profile.

function communityScore(profile, community) {
  let score = 0;

  const interestHits = (profile.interests || []).filter((i) =>
    (community.interests || []).includes(i)
  ).length;
  score += interestHits * 3;

  const priorityHits = (profile.priorities || []).filter((p) =>
    (community.priorities || []).includes(p)
  ).length;
  score += priorityHits * 2;

  // Small baseline so a community with no overlap can still appear
  // (e.g. brand-new profile with nothing filled in yet).
  score += 1;

  return score;
}

export function rankCommunities(profile, communities, limit = 3) {
  if (!communities || communities.length === 0) return [];
  return [...communities]
    .sort((a, b) => communityScore(profile, b) - communityScore(profile, a))
    .slice(0, limit);
}