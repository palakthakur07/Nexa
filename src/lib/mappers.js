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
    // ---- provenance + verification workflow (002_opportunity_engine.sql) ----
    organizationId: r.organization_id || null,
    submittedBy: r.submitted_by || null,
    sourceType: r.source_type || "MANUAL",
    sourceName: r.source_name || r.source || null,
    sourceUrl: r.source_url || null,
    // DRAFT | PENDING_REVIEW | VERIFIED | PUBLISHED | REJECTED | EXPIRED
    verificationStatus: r.verification_status || (r.verified ? "PUBLISHED" : "DRAFT"),
    verifiedAt: r.verified_at || null,
    verifiedBy: r.verified_by || null,
    lastVerifiedAt: r.last_verified_at || null,
    publishedAt: r.published_at || null,
    rejectionReason: r.rejection_reason || null,
  };
}

export function rowToOrganization(r) {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name || "",
    website: r.website || "",
    logoUrl: r.logo_url || "",
    description: r.description || "",
    orgType: r.org_type || "",
    contactName: r.contact_name || "",
    contactEmail: r.contact_email || "",
    // UNVERIFIED | PENDING_VERIFICATION | VERIFIED | SUSPENDED
    verificationStatus: r.verification_status || "UNVERIFIED",
    verifiedAt: r.verified_at || null,
    verifiedBy: r.verified_by || null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function organizationToRow(o) {
  return {
    name: o.name,
    website: o.website || null,
    logo_url: o.logoUrl || null,
    description: o.description || null,
    org_type: o.orgType || null,
    contact_name: o.contactName || null,
    contact_email: o.contactEmail || null,
  };
}

export function rowToSource(r) {
  return {
    id: r.id,
    name: r.name,
    website: r.website || "",
    sourceUrl: r.source_url || "",
    sourceType: r.source_type || "RSS",
    method: r.method || "",
    trustLevel: r.trust_level || "MEDIUM",
    enabled: !!r.enabled,
    refreshFrequency: r.refresh_frequency || "daily",
    lastCheckedAt: r.last_checked_at || null,
    lastSuccessAt: r.last_success_at || null,
    lastError: r.last_error || null,
    opportunitiesFound: r.opportunities_found || 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function sourceToRow(s) {
  return {
    name: s.name,
    website: s.website || null,
    source_url: s.sourceUrl || null,
    source_type: s.sourceType || "RSS",
    method: s.method || null,
    trust_level: s.trustLevel || "MEDIUM",
    enabled: !!s.enabled,
    refresh_frequency: s.refreshFrequency || "daily",
  };
}

export function rowToNotification(r) {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body || "",
    opportunityId: r.opportunity_id || null,
    read: !!r.read,
    createdAt: r.created_at,
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
    isAdmin: Boolean(r.is_admin),
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

