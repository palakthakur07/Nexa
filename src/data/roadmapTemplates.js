// Deterministic roadmap templates — no AI, no randomness, same spirit as
// lib/matching.js and lib/mentorMatching.js. Each template turns the user's
// actual onboarding answers (goals, career stage, interests) into a
// phase-by-phase plan. `pickTemplate()` below chooses one template per user;
// nothing here invents a goal the user didn't pick.
//
// A phase may carry a `resourceFocus` — a hint for roadmapEngine/Roadmap.jsx
// to surface real, matched opportunities or mentors under that phase. This
// never generates fake listings; it's just a filter applied to the live
// catalog (see Roadmap.jsx).

function track(profile) {
  const interest = profile.interests?.[0] || null;
  return interest ? `${interest}` : "Your Path";
}

export const TEMPLATES = {
  "start-business": {
    goalKey: "start-business",
    build: (profile) => ({
      title: `Path to launching your business`,
      description: `A working plan from idea to launch, built around what you told NEXA — ${profile.careerStage || "your current stage"}, focused on ${track(profile)}.`,
      phases: [
        {
          id: "validate",
          title: "Validate your idea",
          description: "Before building anything, confirm there's a real problem worth solving.",
          steps: [
            { id: "validate-1", title: "Write a one-paragraph problem statement", description: "Who has this problem, and how are they solving it today without you?", effort: "30 min" },
            { id: "validate-2", title: "Talk to 5 potential customers", description: "Real conversations, not surveys — listen for the problem, not your pitch.", effort: "1 week" },
          ],
        },
        {
          id: "build",
          title: "Build a first version",
          description: "The smallest thing you can put in front of someone.",
          steps: [
            { id: "build-1", title: "Define your MVP scope", description: "Cut it down to the one thing that proves the idea works.", effort: "1-2 hrs" },
            { id: "build-2", title: "Build and test it with real users", description: "Get it in front of the people you talked to in phase one.", effort: "2-4 weeks" },
          ],
        },
        {
          id: "mentors",
          title: "Find mentors who've done this",
          description: "Founders who've been where you are can save you months.",
          resourceFocus: { kind: "mentor" },
          steps: [
            { id: "mentors-1", title: "Connect with a founder mentor on NEXA", description: "Look for someone who can help with entrepreneurship specifically.", effort: "30 min" },
          ],
        },
        {
          id: "funding",
          title: "Explore funding",
          description: "Grants, incubators, and competitions that fit an early-stage idea.",
          resourceFocus: { kind: "opportunity", types: ["Grant", "Incubator", "Competition"] },
          steps: [
            { id: "funding-1", title: "Shortlist 3 funding sources that fit your stage", description: "Not every program wants a fully-formed company — some want exactly where you are now.", effort: "2-3 hrs" },
            { id: "funding-2", title: "Apply to one", description: "Pick the strongest fit first, not the biggest name.", effort: "1 week" },
          ],
        },
        {
          id: "launch",
          title: "Launch",
          description: "Put it out into the world.",
          steps: [
            { id: "launch-1", title: "Set a launch date and share it publicly", description: "A real date creates real momentum.", effort: "1 day" },
          ],
        },
      ],
    }),
  },

  "return-to-work": {
    goalKey: "return-to-work",
    build: (profile) => ({
      title: `Your return-to-work plan`,
      description: `A plan to rebuild momentum and get back into ${track(profile)}, at your pace.`,
      phases: [
        {
          id: "refresh",
          title: "Refresh your skills",
          description: "Close the gap between where you left off and where the field is now.",
          steps: [
            { id: "refresh-1", title: "List what's changed in your field since your break", description: "Skim a few recent job postings for your old role to spot the gaps.", effort: "1-2 hrs" },
            { id: "refresh-2", title: "Pick one skill to actively refresh", description: "A short course or a small project — depth on one thing beats a skim of ten.", effort: "1-2 weeks" },
          ],
        },
        {
          id: "confidence",
          title: "Rebuild your story",
          description: "Reframe the gap as part of your experience, not a hole in it.",
          steps: [
            { id: "confidence-1", title: "Update your profile with what you did during your break", description: "Caregiving, study, freelance work, volunteering — it counts.", effort: "1 hr" },
          ],
        },
        {
          id: "mentorship",
          title: "Reconnect through mentorship",
          description: "Someone who's navigated a return can help you avoid the hardest parts.",
          resourceFocus: { kind: "mentor" },
          steps: [
            { id: "mentorship-1", title: "Connect with a mentor who's returned to work before", description: "Ask specifically how they handled the gap in interviews.", effort: "30 min" },
          ],
        },
        {
          id: "returnships",
          title: "Look at returnships",
          description: "Programs built specifically to bring people back in.",
          resourceFocus: { kind: "opportunity", types: ["Returnship"] },
          steps: [
            { id: "returnships-1", title: "Shortlist returnship programs that fit your field", description: "These are designed for exactly your situation.", effort: "2-3 hrs" },
          ],
        },
        {
          id: "apply",
          title: "Apply",
          description: "Start putting yourself forward.",
          resourceFocus: { kind: "opportunity" },
          steps: [
            { id: "apply-1", title: "Apply to your first role or program", description: "The first one is the hardest — momentum builds after.", effort: "ongoing" },
          ],
        },
      ],
    }),
  },

  "change-careers": {
    goalKey: "change-careers",
    build: (profile) => ({
      title: `Your career-change plan`,
      description: `A bridge from where you are now (${profile.careerStage || "your current role"}) into ${track(profile)}.`,
      phases: [
        {
          id: "explore",
          title: "Explore the new direction",
          description: "Get specific about what you're actually moving toward.",
          steps: [
            { id: "explore-1", title: "Talk to 2 people already working in the field", description: "Ask what their day-to-day actually looks like.", effort: "1 week" },
          ],
        },
        {
          id: "bridge",
          title: "Close the skills gap",
          description: "Identify and build what's missing between your current and target field.",
          steps: [
            { id: "bridge-1", title: "List the skills the new field asks for that you don't have yet", description: "Check a handful of real job postings.", effort: "1-2 hrs" },
            { id: "bridge-2", title: "Build one project or credential that proves you have them", description: "Concrete proof beats a bullet point on a resume.", effort: "3-6 weeks" },
          ],
        },
        {
          id: "proof",
          title: "Build proof of work",
          description: "Something you can point to, not just talk about.",
          steps: [
            { id: "proof-1", title: "Publish or share your project", description: "A portfolio piece, write-up, or public repo.", effort: "1 week" },
          ],
        },
        {
          id: "network",
          title: "Network in the new field",
          description: "Warm connections open doors cold applications don't.",
          resourceFocus: { kind: "mentor" },
          steps: [
            { id: "network-1", title: "Connect with a mentor already working in the new field", description: "Ask what actually got them hired.", effort: "30 min" },
          ],
        },
        {
          id: "land",
          title: "Land the role",
          description: "Put yourself forward for real opportunities.",
          resourceFocus: { kind: "opportunity" },
          steps: [
            { id: "land-1", title: "Apply to your first opportunity in the new field", description: "Aim for a genuine fit, not the most prestigious name.", effort: "ongoing" },
          ],
        },
      ],
    }),
  },

  "scholarship-study": {
    goalKey: "scholarship-study",
    build: (profile) => ({
      title: `Scholarships & studying abroad`,
      description: `A plan to find and win funding for study, centered on ${track(profile)}.`,
      phases: [
        {
          id: "discover",
          title: "Discover programs",
          description: "Find the scholarships and programs that actually fit you.",
          resourceFocus: { kind: "opportunity", types: ["Scholarship", "Grant"] },
          steps: [
            { id: "discover-1", title: "Shortlist 5 scholarships or programs that fit your profile", description: "Match on field, career stage, and funding type.", effort: "2-3 hrs" },
          ],
        },
        {
          id: "profile",
          title: "Build your application profile",
          description: "The materials every strong application needs.",
          steps: [
            { id: "profile-1", title: "Draft your personal statement", description: "Lead with what you want to do, not just what you've done.", effort: "1 week" },
            { id: "profile-2", title: "Line up your references", description: "Ask early — good recommenders need time.", effort: "1-2 weeks" },
          ],
        },
        {
          id: "apply",
          title: "Apply",
          description: "Submit strong, complete applications.",
          resourceFocus: { kind: "opportunity", types: ["Scholarship", "Grant"] },
          steps: [
            { id: "apply-1", title: "Submit your first application", description: "The first one always takes longest — the rest go faster.", effort: "1 week" },
          ],
        },
        {
          id: "decide",
          title: "Prepare to decide",
          description: "Once offers come in, be ready to choose well.",
          steps: [
            { id: "decide-1", title: "Set your decision criteria in advance", description: "Cost, location, program fit — decide what matters before offers arrive.", effort: "30 min" },
          ],
        },
      ],
    }),
  },

  "find-funding": {
    goalKey: "find-funding",
    build: (profile) => ({
      title: `Finding funding`,
      description: `A plan to find and secure funding relevant to ${track(profile)}.`,
      phases: [
        {
          id: "clarify",
          title: "Clarify what you need",
          description: "Funding searches go faster once the ask is specific.",
          steps: [
            { id: "clarify-1", title: "Write down exactly what the funding is for and how much you need", description: "Specific asks are easier to match to specific sources.", effort: "30 min" },
          ],
        },
        {
          id: "sources",
          title: "Find funding sources",
          description: "Grants, fellowships, and funded programs that fit.",
          resourceFocus: { kind: "opportunity", types: ["Grant", "Fellowship", "Scholarship"] },
          steps: [
            { id: "sources-1", title: "Shortlist 3-5 funding sources that fit your need", description: "Match on eligibility and funding type first.", effort: "2-3 hrs" },
          ],
        },
        {
          id: "apply",
          title: "Apply",
          description: "Submit applications that make the case clearly.",
          steps: [
            { id: "apply-1", title: "Submit your first funding application", description: "Reuse and adapt your materials across applications.", effort: "1 week" },
          ],
        },
        {
          id: "follow-through",
          title: "Follow through",
          description: "Keep the pipeline moving.",
          steps: [
            { id: "follow-1", title: "Track every application's status and deadline", description: "Use Saved on NEXA to keep them in one place.", effort: "ongoing" },
          ],
        },
      ],
    }),
  },

  "first-job-internship": {
    goalKey: "first-job-internship",
    build: (profile) => ({
      title: `Your path into ${track(profile)}`,
      description: `A plan to go from ${profile.careerStage || "where you are now"} to your first role or internship.`,
      phases: [
        {
          id: "foundation",
          title: "Build your foundation",
          description: "The core skills the field expects.",
          steps: [
            { id: "foundation-1", title: "Pick one core skill to focus on first", description: "Depth beats breadth when you're starting out.", effort: "1-2 weeks" },
          ],
        },
        {
          id: "skills",
          title: "Build technical skills",
          description: "Go from learning to doing.",
          steps: [
            { id: "skills-1", title: "Complete one focused course or tutorial track", description: "Pick one and finish it before moving to the next.", effort: "2-4 weeks" },
          ],
        },
        {
          id: "projects",
          title: "Build projects",
          description: "Proof of what you can do, not just what you've studied.",
          steps: [
            { id: "projects-1", title: "Build one small project you can show", description: "Something real, even if small, beats a list of completed courses.", effort: "2-3 weeks" },
          ],
        },
        {
          id: "internships",
          title: "Find internships & entry roles",
          description: "Real, verified opportunities matched to your profile.",
          resourceFocus: { kind: "opportunity", types: ["Internship"] },
          steps: [
            { id: "internships-1", title: "Shortlist internships that fit your profile", description: "Match on field, career stage, and location preference.", effort: "2-3 hrs" },
          ],
        },
        {
          id: "apply",
          title: "Apply",
          description: "Put yourself forward.",
          resourceFocus: { kind: "opportunity" },
          steps: [
            { id: "apply-1", title: "Apply to your first opportunity", description: "The first application is the hardest one.", effort: "ongoing" },
          ],
        },
      ],
    }),
  },

  "mentors-network": {
    goalKey: "mentors-network",
    build: (profile) => ({
      title: `Building your network`,
      description: `A plan to find mentors and grow your network around ${track(profile)}.`,
      phases: [
        {
          id: "ready",
          title: "Get mentor-ready",
          description: "Know what you're actually asking for.",
          steps: [
            { id: "ready-1", title: "Write down 1-2 specific things you want help with", description: "\"Can you mentor me\" is harder to say yes to than a specific ask.", effort: "20 min" },
          ],
        },
        {
          id: "find",
          title: "Find the right people",
          description: "Real, self-registered mentors on NEXA matched to your goals.",
          resourceFocus: { kind: "mentor" },
          steps: [
            { id: "find-1", title: "Browse mentors matched to your profile", description: "Look for overlap in field, goals, and what they can help with.", effort: "30 min" },
          ],
        },
        {
          id: "ask",
          title: "Make the ask",
          description: "Reach out with something specific.",
          steps: [
            { id: "ask-1", title: "Send your first connection request", description: "Reference the specific thing you want help with.", effort: "15 min" },
          ],
        },
        {
          id: "relationship",
          title: "Build the relationship",
          description: "One good conversation can turn into an ongoing relationship.",
          steps: [
            { id: "relationship-1", title: "Follow up after your first conversation", description: "A short thank-you and a note on what you'll do with the advice.", effort: "10 min" },
          ],
        },
      ],
    }),
  },

  "build-skills": {
    goalKey: "build-skills",
    build: (profile) => ({
      title: `Building your skills`,
      description: `A focused plan to build real skills in ${track(profile)}.`,
      phases: [
        {
          id: "focus",
          title: "Pick a focus area",
          description: "One area, deeply, beats many areas shallowly.",
          steps: [
            { id: "focus-1", title: "Choose one skill to focus on for the next month", description: "Pick based on your goals, not what's trending.", effort: "20 min" },
          ],
        },
        {
          id: "learn",
          title: "Learn",
          description: "Structured learning on your chosen focus.",
          steps: [
            { id: "learn-1", title: "Complete one course or structured resource", description: "Finish what you start before adding another.", effort: "2-4 weeks" },
          ],
        },
        {
          id: "practice",
          title: "Practice with a project",
          description: "Turn learning into something real.",
          steps: [
            { id: "practice-1", title: "Build one project using what you learned", description: "Small and finished beats big and abandoned.", effort: "2-3 weeks" },
          ],
        },
        {
          id: "proof",
          title: "Show proof of work",
          description: "Make it visible.",
          steps: [
            { id: "proof-1", title: "Share your project publicly", description: "A portfolio, write-up, or public repo.", effort: "1-2 hrs" },
          ],
        },
        {
          id: "next",
          title: "Take the next step",
          description: "Turn the new skill into an opportunity.",
          resourceFocus: { kind: "opportunity" },
          steps: [
            { id: "next-1", title: "Explore opportunities that use your new skill", description: "Let NEXA match you to what fits.", effort: "1 hr" },
          ],
        },
      ],
    }),
  },

  general: {
    goalKey: "general",
    build: (profile) => ({
      title: `Getting started with NEXA`,
      description: `A first plan to help you find direction — update your goals anytime and NEXA will rebuild this.`,
      phases: [
        {
          id: "orient",
          title: "Get to know NEXA",
          description: "See what's here before deciding where to focus.",
          steps: [
            { id: "orient-1", title: "Browse opportunities matched to your profile", description: "See what's out there before narrowing in.", effort: "20 min" },
          ],
        },
        {
          id: "explore",
          title: "Explore what fits",
          description: "Narrow toward a direction that feels right.",
          steps: [
            { id: "explore-1", title: "Update your goals in your profile", description: "The more specific your goals, the more specific NEXA's plan for you can be.", effort: "10 min" },
          ],
        },
        {
          id: "first-step",
          title: "Take a first step",
          description: "Momentum starts with one concrete action.",
          resourceFocus: { kind: "opportunity" },
          steps: [
            { id: "first-step-1", title: "Save your first opportunity", description: "Pick anything that looks interesting — you can change direction later.", effort: "10 min" },
          ],
        },
        {
          id: "momentum",
          title: "Build momentum",
          description: "Small, consistent steps beat sporadic big ones.",
          steps: [
            { id: "momentum-1", title: "Ask NEXA what to do next", description: "NEXA can suggest a next step once it knows more about your goals.", effort: "5 min" },
          ],
        },
      ],
    }),
  },
};

// Priority order — most specific/actionable goal wins when the user picked
// several. Falls through to career-stage signals, then the general template.
export function pickTemplateKey(profile) {
  const goals = profile.goals || [];
  const has = (g) => goals.includes(g);

  if (has("Start a business")) return "start-business";
  if (has("Return to work") || profile.careerStage === "Returning to work") return "return-to-work";
  if (has("Change careers")) return "change-careers";
  if (has("Get a scholarship") || has("Study abroad")) return "scholarship-study";
  if (has("Find funding")) return "find-funding";
  if (has("Find an internship") || has("Get my first job")) return "first-job-internship";
  if (has("Build my skills")) return "build-skills";
  if (has("Find mentors") || has("Grow my network")) return "mentors-network";
  if (profile.careerStage === "Entrepreneur") return "start-business";
  return "general";
}
