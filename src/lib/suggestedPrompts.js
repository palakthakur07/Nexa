// Generates contextual suggested prompts — never one universal set. Draws
// from the user's profile and, when present, the entry context (an
// opportunity or a woman the user opened NEXA from).
export function generateSuggestedPrompts(profile, entryContext) {
  if (entryContext?.type === "opportunity") {
    return ["Why did you recommend this?", "Am I eligible for this?", "Which is my next step here?", "Add this to my roadmap"];
  }
  if (entryContext?.type === "woman") {
    return ["Why did you recommend her?", "What should I ask her?", "Who else could help me?", "Help me draft my request"];
  }
  if (entryContext?.type === "roadmap") {
    return ["Why is this my next step?", "How can I complete this faster?", "Find opportunities related to this phase", "What should I learn next?"];
  }

  const prompts = ["What's my smartest next step?"];

  if (profile.goals?.includes("Start a business")) prompts.push("Which funding opportunities fit my startup goal?");
  else if (profile.goals?.includes("Study abroad") || profile.goals?.includes("Get a scholarship")) prompts.push("How should I prepare for studying abroad?");
  else if (profile.goals?.includes("Return to work")) prompts.push("What should I focus on for my return to work?");
  else if (profile.goals?.includes("Change careers")) prompts.push("How do I plan a career change?");
  else prompts.push("Which opportunity should I prioritize?");

  if (profile.priorities?.includes("Funding")) prompts.push("Which of my matches are fully funded?");
  if (profile.priorities?.includes("Mentorship") || profile.goals?.includes("Find mentors")) prompts.push("Who should I talk to?");

  prompts.push("Review my current roadmap");
  prompts.push("Help me plan the next 30 days");

  return [...new Set(prompts)].slice(0, 6);
}

export const PROMPT_CATEGORIES = [
  { key: "next-step", label: "My next step", prompts: ["What's my smartest next step?", "Am I falling behind?"] },
  { key: "opportunities", label: "Opportunities", prompts: ["Which opportunity should I prioritize?", "Compare my saved opportunities.", "Which ones are fully funded?"] },
  { key: "career", label: "Career", prompts: ["What are my strengths?", "What am I missing?", "What skills should I develop?"] },
  { key: "applications", label: "Applications", prompts: ["Help me write a scholarship essay.", "Help me write an email.", "What should I do before applying?"] },
  { key: "network", label: "Network", prompts: ["Who should I talk to?", "Who has experience studying abroad?"] },
  { key: "roadmap", label: "Roadmap", prompts: ["Review my current roadmap.", "Build me a 30-day plan."] },
];
