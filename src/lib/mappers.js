// Maps between snake_case Supabase rows and the camelCase shapes the rest of
// the app already expects (opportunities.js / women.js schemas), so no UI
// component had to change its property names when data moved to the backend.

export function rowToCommunity(r) {
  return { id: r.id, name: r.name, category: r.category, why: r.why };
}

export function rowToOpportunity(r) {
  return {
    id: r.id,
    title: r.title,
    organization: r.organization,
    type: r.type,
    description: r.description,
    location: r.location,
    remote: r.remote,
    categories: r.categories || [],
    goals: r.goals || [],
    careerStages: r.career_stages || [],
    skills: r.skills || [],
    funding: r.funding || { type: "", amount: null },
    deadline: r.deadline,
    eligibility: r.eligibility || [],
    benefits: r.benefits || [],
    applicationUrl: r.application_url || "#",
    source: r.source,
    verified: r.verified,
  };
}

export function rowToWoman(r) {
  return {
    id: r.id,
    name: r.name,
    headline: r.headline,
    location: r.location,
    about: r.about,
    journey: r.journey || [],
    journeyTags: r.journey_tags || [],
    relevantGoals: r.relevant_goals || [],
    experience: r.experience || [],
    skills: r.skills || [],
    canHelpWith: r.can_help_with || [],
    willingToHelpWith: r.willing_to_help_with || [],
    languages: r.languages || [],
    availability: r.availability,
    verified: r.verified,
    experienceLevel: r.experience_level,
  };
}

export function rowToProfile(r) {
  return {
    name: r.name || "",
    email: r.email || "",
    location: r.location || { country: "", city: "", openToRelocation: "" },
    careerStage: r.career_stage || "",
    interests: r.interests || [],
    goals: r.goals || [],
    skills: r.skills || [],
    priorities: r.priorities || [],
    helpTopics: r.help_topics || [],
    giveBack: r.give_back || null,
    customRoadmapItems: r.custom_roadmap_items || [],
    onboardingComplete: Boolean(r.onboarding_complete),
  };
}

export function profileToRow(p) {
  return {
    name: p.name,
    location: p.location,
    career_stage: p.careerStage,
    interests: p.interests,
    goals: p.goals,
    skills: p.skills,
    priorities: p.priorities,
    help_topics: p.helpTopics,
    give_back: p.giveBack,
    custom_roadmap_items: p.customRoadmapItems,
    onboarding_complete: p.onboardingComplete,
    updated_at: new Date().toISOString(),
  };
}

