// Option lists specific to the women network — filters, help-request flow.
export const EXPERIENCE_AREAS = [
  "AI & Technology", "Business", "Design", "Research", "Finance",
  "Healthcare", "Law", "Marketing", "Education", "Leadership", "Entrepreneurship",
];

export const JOURNEY_TAGS = [
  "Study Abroad", "Career Change", "Career Return", "First Job", "Women in Tech",
  "Entrepreneurship", "Funding", "Leadership", "Research", "Interview Preparation",
  "Freelancing", "Higher Education",
];

export const HELP_TYPES = [
  "Career advice", "Mentorship", "Application review", "Interview preparation",
  "Portfolio feedback", "Entrepreneurship", "Study abroad guidance", "Networking",
];

export const REQUEST_TYPES = ["Quick question", "15-minute chat", "Feedback", "Mentorship", "Advice"];

export const LANGUAGES = ["English", "Hindi", "Tamil", "Spanish", "Mandarin", "French"];

export const NETWORK_LOCATIONS = ["India", "International", "Remote"];

// Maps an onboarding goal to the journey tag most likely to help with it —
// used by the woman-matching engine's "journey alignment" factor.
export const GOAL_TO_JOURNEY_TAG = {
  "Study abroad": "Study Abroad",
  "Get a scholarship": "Study Abroad",
  "Change careers": "Career Change",
  "Return to work": "Career Return",
  "Start a business": "Entrepreneurship",
  "Find funding": "Funding",
  "Get my first job": "First Job",
  "Find an internship": "First Job",
  "Grow my network": "Networking",
  "Build my skills": "Higher Education",
  "Find mentors": "Leadership",
};
