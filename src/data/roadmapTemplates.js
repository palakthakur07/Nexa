// Roadmap phase/step templates, keyed by "track". A track is chosen from the
// user's goals (see lib/roadmapEngine.js#pickTrack) — this file only holds
// content, never profile-reading logic, so it stays easy to extend with a
// new track without touching the engine.
//
// Every step is intentionally concrete (per the brief: "Complete one
// beginner machine-learning project", not "improve your skills"). `effort`
// is a rough time estimate shown in the UI. `find` (optional) tells the
// engine to attach real catalog opportunities to that step/phase — `types`
// and `categories` narrow the search, `goalsAny` OR-matches against the
// opportunity's own goals list.

export const TRACKS = {
  SCHOLARSHIP: "scholarship",
  EARLY_CAREER: "earlyCareer",
  CAREER_CHANGE: "careerChange",
  RETURNING: "returning",
  FOUNDER: "founder",
  FUNDING: "funding",
  GROWTH: "growth",
};

const find = (overrides) => ({ ...overrides });

export function scholarshipTrack({ interests, isStudent }) {
  const field = interests[0] || "your field";
  return [
    {
      key: "define-target",
      title: "Define Your Direction",
      description: "Get specific about what you're applying for before you start applying.",
      steps: [
        {
          key: "shortlist-programs",
          title: "Shortlist 3-5 target programs or destinations",
          description: "Narrow down countries, universities, or programs that fit your goals and budget.",
          effort: "2-3 hrs",
        },
        {
          key: "list-requirements",
          title: "List each program's eligibility and deadlines",
          description: "Write down GPA, test score, and document requirements side by side so nothing is missed.",
          effort: "1-2 hrs",
        },
      ],
    },
    {
      key: "build-profile",
      title: "Build Your Scholarship Profile",
      description: `Strengthen the parts of your profile that scholarship committees weigh most in ${field}.`,
      steps: [
        {
          key: "draft-sop",
          title: "Write a first draft of your statement of purpose",
          description: "Get your story, motivation, and goals down on paper — polish comes later.",
          effort: "3-4 hrs",
        },
        {
          key: "recommenders",
          title: "Ask two people for letters of recommendation",
          description: "Give your recommenders at least 3 weeks' notice and a summary of your goals.",
          effort: "1 hr",
        },
        isStudent
          ? { key: "test-scores", title: "Register for any required standardized test", description: "Check whether your target programs need IELTS/TOEFL/GRE/GMAT and book a date.", effort: "1-2 hrs" }
          : { key: "portfolio", title: "Assemble supporting documents and transcripts", description: "Collect transcripts, certificates, and a CV in the format each program asks for.", effort: "2 hrs" },
      ],
    },
    {
      key: "find-funding",
      title: "Find Funding & Scholarships",
      description: "See which verified, funded opportunities on NEXA actually match your profile.",
      find: { phase: true, types: ["Scholarship", "Fellowship", "Grant"], categories: interests },
      steps: [
        { key: "apply-first", title: "Apply to your first matched scholarship", description: "Start with the opportunity NEXA ranks as your strongest match.", effort: "2-4 hrs" },
      ],
    },
    {
      key: "apply",
      title: "Submit Applications",
      description: "Turn your shortlist into submitted applications.",
      steps: [
        { key: "final-review", title: "Get a second pair of eyes on your application", description: "Ask a mentor or peer to review your statement and forms before you submit.", effort: "1 hr" },
        { key: "submit-apps", title: "Submit your applications before the deadline", description: "Aim to submit at least 48 hours before the deadline in case of technical issues.", effort: "1 hr" },
      ],
    },
  ];
}

export function earlyCareerTrack({ interests, isStudent, skills }) {
  const field = interests[0] || "your field";
  const phases = [];
  if (isStudent || skills.length === 0) {
    phases.push({
      key: "foundation",
      title: "Build Your Foundation",
      description: `Strengthen the core skills that ${field} internships and first jobs screen for.`,
      steps: [
        { key: "core-skill", title: `Complete one beginner course in ${field}`, description: "Pick a single, well-reviewed course and finish it end to end rather than sampling several.", effort: "1-2 weeks" },
        { key: "first-project", title: "Build one small project you can show", description: "A finished, simple project beats an ambitious, unfinished one on your resume.", effort: "1 week" },
      ],
    });
  }
  phases.push(
    {
      key: "resume",
      title: "Get Application-Ready",
      description: "Make sure your resume and profile can actually get you noticed.",
      steps: [
        { key: "resume-draft", title: "Write or update your resume", description: "One page, quantify your impact where you can, and tailor it to the roles you want.", effort: "2 hrs" },
        { key: "linkedin", title: "Complete your NEXA profile and LinkedIn", description: "A complete profile is what makes NEXA's matches — and recruiters — take you seriously.", effort: "1 hr" },
      ],
    },
    {
      key: "experience",
      title: "Gain Experience",
      description: "Real, verified opportunities that match what you've told NEXA.",
      find: { phase: true, types: ["Internship", "Fellowship", "Job"], categories: interests },
      steps: [
        { key: "apply-internships", title: "Apply to 3 matched internships or entry roles", description: "Quality over quantity — tailor each application to the specific listing.", effort: "3-5 hrs" },
      ],
    },
    {
      key: "applications",
      title: "Start Applying",
      description: "NEXA keeps finding opportunities that match your profile as you go.",
      steps: [
        { key: "track-apps", title: "Track every application's status", description: "Use Saved to move each application from Interested through Applied to Interview.", effort: "ongoing" },
        { key: "mock-interview", title: "Do one mock interview", description: "Practice answering \"tell me about yourself\" and one technical/behavioral question out loud.", effort: "1 hr" },
      ],
    }
  );
  return phases;
}

export function careerChangeTrack({ interests, skills }) {
  const field = interests[0] || "your new field";
  return [
    {
      key: "validate",
      title: "Validate the Direction",
      description: `Make sure ${field} is the right move before you invest months in it.`,
      steps: [
        { key: "informational", title: "Have one informational conversation with someone in the field", description: "Ask a NEXA mentor what their day-to-day actually looks like.", effort: "30 min" },
        { key: "gap-analysis", title: "List the skills you have vs. the skills the field needs", description: "Be specific — this list becomes your learning plan in the next phase.", effort: "1 hr" },
      ],
    },
    {
      key: "reskill",
      title: "Build the New Skillset",
      description: "Close the gap with focused, provable learning.",
      steps: [
        { key: "core-course", title: `Complete one structured course in ${field}`, description: "Choose depth over breadth — one finished course outweighs five started ones.", effort: "2-4 weeks" },
        skills.length > 0
          ? { key: "bridge-project", title: "Build a project that connects your old and new skills", description: "Employers respond well to a transition story backed by a real project.", effort: "1-2 weeks" }
          : { key: "first-project", title: "Build one project in your new field", description: "Something small and finished you can talk through in an interview.", effort: "1-2 weeks" },
      ],
    },
    {
      key: "network",
      title: "Find Mentors & Community",
      description: "People who've made a similar switch shorten the learning curve.",
      find: { phase: false },
      steps: [
        { key: "mentor-connect", title: "Connect with a mentor who's changed careers before", description: "Send a specific, low-pressure request through NEXA's network.", effort: "20 min" },
      ],
    },
    {
      key: "apply",
      title: "Make the Move",
      description: "Turn your new skillset into applications.",
      find: { phase: true, categories: interests },
      steps: [
        { key: "rewrite-resume", title: "Rewrite your resume around your new direction", description: "Lead with transferable skills and the project you built, not your old title.", effort: "2 hrs" },
        { key: "apply-roles", title: "Apply to 3 roles or programs matched to your new direction", description: "Start with the ones NEXA ranks as strongest matches.", effort: "3-5 hrs" },
      ],
    },
  ];
}

export function returningTrack({ interests }) {
  return [
    {
      key: "refresh",
      title: "Refresh Your Skills",
      description: "Close any gaps that opened up during your time away.",
      steps: [
        { key: "landscape-check", title: `Spend an hour on what's changed in ${interests[0] || "your field"}`, description: "Read two or three recent articles or a short update course to re-orient yourself.", effort: "1-2 hrs" },
        { key: "refresh-course", title: "Complete one short refresher course", description: "Pick the tool, platform, or skill that changed most while you were away.", effort: "1 week" },
      ],
    },
    {
      key: "confidence",
      title: "Rebuild Your Story",
      description: "Turn your career break into a confident, honest narrative.",
      steps: [
        { key: "gap-story", title: "Write one paragraph explaining your career gap", description: "Own it plainly and pivot straight into what you bring now — no over-explaining needed.", effort: "30 min" },
        { key: "resume-update", title: "Update your resume for a return to work", description: "Lead with your strongest experience; a functional or hybrid format often works well here.", effort: "1-2 hrs" },
      ],
    },
    {
      key: "mentorship",
      title: "Find Mentorship",
      description: "Talk to someone who has successfully returned to work before.",
      find: { phase: false },
      steps: [
        { key: "returnship-mentor", title: "Connect with a mentor who's returned to work", description: "Ask specifically about how they handled the gap and their first 90 days back.", effort: "20 min" },
      ],
    },
    {
      key: "returnship",
      title: "Find a Returnship",
      description: "Structured return-to-work programs are built for exactly this transition.",
      find: { phase: true, types: ["Returnship", "Fellowship", "Job"], categories: interests },
      steps: [
        { key: "apply-returnship", title: "Apply to a matched returnship or role", description: "Start with programs designed specifically for people returning after a break.", effort: "2-4 hrs" },
      ],
    },
    {
      key: "applications",
      title: "Apply With Confidence",
      description: "You're ready — now it's a numbers-and-follow-up game.",
      steps: [
        { key: "apply-roles", title: "Apply to 3 matched roles", description: "Tailor each application; reuse your gap-story paragraph where relevant.", effort: "3-5 hrs" },
      ],
    },
  ];
}

export function founderTrack({ interests }) {
  return [
    {
      key: "validate-idea",
      title: "Validate Your Idea",
      description: "Confirm real people want this before you build more.",
      steps: [
        { key: "problem-statement", title: "Write a one-paragraph problem statement", description: "State exactly who has the problem and why existing options fall short.", effort: "1 hr" },
        { key: "customer-interviews", title: "Talk to 5 potential customers", description: "Ask about their problem, not your idea — resist pitching during these conversations.", effort: "1 week" },
      ],
    },
    {
      key: "build",
      title: "Build a First Version",
      description: "Get something real in front of people, however small.",
      steps: [
        { key: "mvp", title: "Build a minimum viable version", description: "A landing page, prototype, or manual service can count — it just has to test the core assumption.", effort: "2-4 weeks" },
        { key: "first-users", title: "Get 5-10 people to actually try it", description: "Real usage, even from friends and family first, beats hypothetical interest.", effort: "1-2 weeks" },
      ],
    },
    {
      key: "mentors",
      title: "Find Mentors",
      description: "Founders who've built something similar can save you months.",
      find: { phase: false },
      steps: [
        { key: "founder-mentor", title: "Connect with a founder mentor on NEXA", description: "Ask about the mistake they'd avoid if they started again.", effort: "20 min" },
      ],
    },
    {
      key: "funding",
      title: "Explore Funding",
      description: "Verified funding and incubator opportunities matched to your profile.",
      find: { phase: true, types: ["Incubator", "Grant", "Competition"], categories: interests, goalsAny: ["Find funding", "Start a business"] },
      steps: [
        { key: "apply-incubator", title: "Apply to one matched incubator, grant, or competition", description: "Pick the strongest match rather than applying everywhere at once.", effort: "3-5 hrs" },
      ],
    },
    {
      key: "launch",
      title: "Launch",
      description: "Take the version people responded to and put it out publicly.",
      steps: [
        { key: "launch-plan", title: "Write a simple launch checklist", description: "Where you'll announce it, who you'll tell first, and how you'll collect feedback.", effort: "2 hrs" },
        { key: "launch-it", title: "Launch to your first real audience", description: "Small and real beats big and delayed.", effort: "1 day" },
      ],
    },
  ];
}

export function fundingTrack({ interests }) {
  return [
    {
      key: "define-need",
      title: "Define What You Need",
      description: "Get specific about the funding you're looking for.",
      steps: [
        { key: "funding-type", title: "Decide what type of funding fits your goal", description: "Grant, scholarship, competition, or investment — each has a different application path.", effort: "1 hr" },
      ],
    },
    {
      key: "find-funding",
      title: "Find Matched Funding",
      description: "Real, verified funding opportunities that match your profile.",
      find: { phase: true, types: ["Grant", "Scholarship", "Fellowship", "Competition"], categories: interests, goalsAny: ["Find funding"] },
      steps: [
        { key: "shortlist-funding", title: "Shortlist your top 3 matched opportunities", description: "Compare deadlines and requirements before committing your time.", effort: "1-2 hrs" },
      ],
    },
    {
      key: "prepare",
      title: "Prepare Your Application",
      description: "Most funding decisions come down to a clear, specific application.",
      steps: [
        { key: "funding-pitch", title: "Write a one-page summary of what you need funding for", description: "Be concrete about the amount, the use, and the outcome you expect.", effort: "2 hrs" },
      ],
    },
    {
      key: "apply",
      title: "Apply",
      description: "Submit and follow up.",
      steps: [
        { key: "submit-funding", title: "Submit your funding application", description: "Double-check every required document is attached before submitting.", effort: "1-2 hrs" },
      ],
    },
  ];
}

export function growthTrack({ interests, priorities }) {
  const field = interests[0] || "your field";
  const wantsMentor = priorities.includes("Mentorship");
  const wantsNetwork = priorities.includes("Networking");
  return [
    {
      key: "skills",
      title: "Build Your Skills",
      description: `Focused, concrete growth in ${field} rather than open-ended learning.`,
      steps: [
        { key: "skill-course", title: `Complete one course or certification in ${field}`, description: "Pick one and finish it — depth beats browsing several.", effort: "1-2 weeks" },
        { key: "skill-project", title: "Build one project that uses your new skill", description: "Something small enough to finish and specific enough to talk about.", effort: "1 week" },
      ],
    },
    {
      key: "connect",
      title: wantsMentor || wantsNetwork ? "Find Mentors & Community" : "Grow Your Network",
      description: "The people around you shape how fast you grow.",
      find: { phase: false },
      steps: [
        { key: "connect-mentor", title: "Connect with one mentor on NEXA", description: "Send a specific request rather than a general \"can you help me\" message.", effort: "20 min" },
        { key: "join-community", title: "Join one relevant community", description: "Show up once, even briefly — consistency matters more than intensity.", effort: "30 min" },
      ],
    },
    {
      key: "opportunities",
      title: "Explore Opportunities",
      description: "Real opportunities matched to your interests and goals.",
      find: { phase: true, categories: interests },
      steps: [
        { key: "explore-matches", title: "Review your top matched opportunities", description: "Save the ones that genuinely fit — quality over quantity.", effort: "30 min" },
      ],
    },
    {
      key: "apply",
      title: "Take Action",
      description: "Turn exploration into a concrete next step.",
      steps: [
        { key: "act-on-match", title: "Apply to or act on one matched opportunity", description: "Pick the single strongest match and follow it through completely.", effort: "2-4 hrs" },
      ],
    },
  ];
}
