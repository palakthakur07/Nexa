// Deterministic "NEXA demo mode" — no randomness, no external call. Every
// response is derived from the actual context object, never invented.
// This is what runs whenever no AI provider is configured (see
// nexaAIService.js), which is the default and only fully-tested path in
// this environment.
import { deadlineStatus, formatDeadline } from "./deadline.js";

function fmtPct(n) { return `${n}%`; }

function greetingOpener(ctx) {
  const name = ctx.user.name ? `, ${ctx.user.name}` : "";
  if (ctx.currentOpportunity) {
    const o = ctx.currentOpportunity;
    const goalNote = ctx.user.goals.length ? ` You have a strong match here, especially because ${ctx.user.priorities[0] ? ctx.user.priorities[0].toLowerCase() : "your priorities"} and ${ctx.user.goals[0].toLowerCase()} both matter to you.` : "";
    return `I've got **${o.title}** open with you.\n\nIt's a ${fmtPct(o.match)} match.${goalNote}\n\nWhat would you like to know?`;
  }
  if (ctx.currentMentor) {
    const m = ctx.currentMentor;
    return `I've got **${m.name}**'s profile open with you — ${m.headline.toLowerCase()}, a ${fmtPct(m.match)} match for what you're working on.\n\nWant to know why I recommended them, or how to reach out?`;
  }
  return `Hi${name}. Ask me about your goals, opportunities, career, applications, or what to do next.`;
}

function respondNextStep(ctx) {
  const done = ctx.roadmap.filter((r) => r.status === "done").length;
  const total = ctx.roadmap.length;
  const now = ctx.roadmap.find((r) => r.status === "now");
  const savedCount = ctx.savedOpportunities.length;

  let content = `You've completed ${done} of ${total} current roadmap steps.\n\n`;
  content += `**Your next move:** ${ctx.nextMove.title}\n${ctx.nextMove.why}`;
  if (savedCount > 0) content += `\n\nYou already have ${savedCount} saved opportunit${savedCount === 1 ? "y" : "ies"}. Want me to compare them?`;
  else if (ctx.topOpportunities[0]) content += `\n\nYour strongest match right now is **${ctx.topOpportunities[0].title}** at ${fmtPct(ctx.topOpportunities[0].match)}. Want a closer look?`;

  const actions = [];
  if (now) actions.push({ type: "VIEW_ROADMAP", label: "View roadmap" });
  if (ctx.topOpportunities[0]) actions.push({ type: "OPEN_OPPORTUNITY", label: "Open top match", payload: { id: ctx.topOpportunities[0].id } });
  return { content, actions };
}

function respondPrioritizeOpportunity(ctx, message) {
  let pool = [...ctx.topOpportunities];
  if (/fully funded|funded/.test(message)) pool = pool.filter((o) => o.funding === "Fully funded");
  if (/close|deadline|soon/.test(message)) pool = [...pool].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (pool.length === 0) {
    return { content: "I don't see an opportunity in your matches that fits that — want me to widen the search on Discover?", actions: [{ type: "OPEN_DISCOVER", label: "Open Discover" }] };
  }
  const top = pool[0];
  const status = deadlineStatus(top.deadline);
  let content = `Based on your profile, I'd prioritize **${top.title}** — a ${fmtPct(top.match)} match.\n\n`;
  content += `**Why:**\n- It's ${top.funding.toLowerCase()}\n- Deadline is ${formatDeadline(top.deadline)} (${status.label.toLowerCase()})\n- It lines up with ${top.categories.slice(0, 2).join(" and ")}\n\n`;
  content += `**Your next move:** review the eligibility requirements before anything else.`;
  const isSaved = ctx.savedOpportunities.some((s) => s.id === top.id);
  const actions = [{ type: "OPEN_OPPORTUNITY", label: "View opportunity", payload: { id: top.id } }];
  if (!isSaved) actions.push({ type: "SAVE_OPPORTUNITY", label: "Save it", payload: { id: top.id } });
  actions.push({ type: "ADD_TO_ROADMAP", label: "Add to roadmap", payload: { label: `Apply to ${top.title}` } });
  return { content, actions };
}

function respondCompareSaved(ctx) {
  if (ctx.savedOpportunities.length === 0) {
    return { content: "You haven't saved any opportunities yet, so there's nothing to compare. Want me to point you to your strongest matches instead?", actions: [{ type: "OPEN_DISCOVER", label: "See matches" }] };
  }
  const lines = ctx.savedOpportunities.map((s, i) => `${i + 1}. **${s.title}** — ${fmtPct(s.match)} match, status: ${s.status}`).join("\n");
  return {
    content: `Here's how your saved opportunities compare:\n\n${lines}\n\nI'd focus on whichever has the closest deadline first — want me to check?`,
    actions: [{ type: "VIEW_SAVED", label: "Open saved list" }],
  };
}

function respondEligibility(ctx) {
  if (!ctx.currentOpportunity) {
    return { content: "I'm not able to verify eligibility without an opportunity open. Open one from Discover and ask me again — I'll walk through what's known and what you should double-check yourself.", actions: [{ type: "OPEN_DISCOVER", label: "Open Discover" }] };
  }
  const o = ctx.currentOpportunity;
  const lines = o.eligibility.map((e) => `- ${e}`).join("\n");
  return {
    content: `Here's what's listed for **${o.title}**:\n\n${lines}\n\nThis looks aligned with parts of your profile, but I can't verify eligibility — always confirm directly with the organization.`,
    actions: [
      { type: "OPEN_OPPORTUNITY", label: "Open full listing", payload: { id: o.id } },
      { type: "ADD_TO_ROADMAP", label: "Add eligibility review to roadmap", payload: { label: `Review eligibility for ${o.title}` } },
    ],
  };
}

function respondNetwork(ctx) {
  if (ctx.recommendedMentors.length === 0) {
    return {
      content: "I don't have a real mentor match for this yet — either no one matching your interests has registered on the network so far, or your profile could use more detail. This isn't something I'll guess at.",
      actions: [{ type: "OPEN_PROFILE", label: "Update profile" }, { type: "OPEN_NETWORK", label: "Browse the network" }],
    };
  }
  const top = ctx.recommendedMentors[0];
  let content = `**${top.name}** may be your best bet — ${fmtPct(top.match)} match, ${top.headline.toLowerCase()}.\n\n`;
  content += `They can help with:\n${top.canHelpWith.slice(0, 3).map((c) => `- ${c}`).join("\n")}`;
  if (ctx.recommendedMentors[1]) content += `\n\n**${ctx.recommendedMentors[1].name}** is also a strong option if they're not available.`;
  return { content, actions: [{ type: "OPEN_MENTOR_PROFILE", label: `View ${top.name.split(" ")[0]}'s profile`, payload: { id: top.id } }] };
}

function respondRoadmapStatus(ctx, message) {
  const done = ctx.roadmap.filter((r) => r.status === "done");
  const total = ctx.roadmap.length;
  const now = ctx.roadmap.find((r) => r.status === "now");
  const later = ctx.roadmap.filter((r) => r.status === "later");

  if (/30.day|30 day|plan/.test(message)) {
    const items = [now, ...later].filter(Boolean).slice(0, 3);
    if (items.length === 0) return { content: "Your roadmap is already fully underway — nothing left to plan for right now.", actions: [{ type: "VIEW_ROADMAP", label: "View roadmap" }] };
    const weeks = items.map((it, i) => `**Week ${(i * 2) + 1}–${(i * 2) + 2}:** ${it.label}`).join("\n");
    return { content: `Here's a simple 30-day plan based on where you are:\n\n${weeks}\n\nOne step at a time — want me to add any of these to your roadmap?`, actions: [{ type: "VIEW_ROADMAP", label: "View roadmap" }] };
  }

  let content = `You've completed ${done.length} of ${total} roadmap steps.`;
  if (now) content += `\n\n**Up next:** ${now.label}`;
  else content += `\n\nEverything on your current roadmap is done — nice work. Want a new step added?`;
  return { content, actions: [{ type: "VIEW_ROADMAP", label: "View roadmap" }] };
}

function respondProfile(ctx, message) {
  const strengths = [];
  if (ctx.user.skills.length > 0) strengths.push(`hands-on experience in ${ctx.user.skills.slice(0, 2).join(" and ")}`);
  if (ctx.user.interests.length > 0) strengths.push(`clear focus on ${ctx.user.interests[0]}`);
  if (ctx.user.goals.length > 0) strengths.push(`a defined goal (${ctx.user.goals[0].toLowerCase()})`);

  if (/missing|gap|weak/.test(message)) {
    const gaps = [];
    if (ctx.user.skills.length === 0) gaps.push("no skills added yet — this sharpens your opportunity matches");
    if (ctx.user.priorities.length === 0) gaps.push("no priorities set — I use these to rank what matters most to you");
    if (gaps.length === 0) return { content: "Your profile is fairly complete. If anything, keep it updated as your goals shift — I'll adjust recommendations automatically.", actions: [{ type: "OPEN_PROFILE", label: "Review profile" }] };
    return { content: `A couple of gaps worth filling in:\n${gaps.map((g) => `- ${g}`).join("\n")}`, actions: [{ type: "OPEN_PROFILE", label: "Update profile" }] };
  }

  if (strengths.length === 0) {
    return { content: "I don't have enough of your profile filled in yet to say much with confidence. Adding your goals and skills would help me a lot.", actions: [{ type: "OPEN_PROFILE", label: "Complete profile" }] };
  }
  return { content: `Based on what you've told me, your strengths right now are:\n${strengths.map((s) => `- ${s}`).join("\n")}\n\nThat's a solid starting point for the opportunities I'm tracking for you.`, actions: [{ type: "OPEN_DISCOVER", label: "See matched opportunities" }] };
}

function respondApplicationSupport(message) {
  if (/essay|sop|statement of purpose/.test(message)) {
    return { content: "I can help you structure it. A strong statement of purpose usually covers:\n\n1. What draws you to this specific opportunity\n2. A concrete example that shows your experience\n3. What you'd do with it, and why now\n\nShare a draft or a few bullet points and I'll help you tighten it — I won't write the whole thing for you, since it should sound like you." };
  }
  if (/email/.test(message)) {
    return { content: "Happy to help with the email. Tell me: who it's to, what you're asking for, and any context they'd need — I'll help you shape a concise draft." };
  }
  return { content: "Tell me a bit more about what you're working on — an essay, an email, or something else — and I'll help you structure it. I can help you tighten your own writing, not generate a finished document for you." };
}

function respondPersonalizedRoadmap(ctx) {
  const pr = ctx.personalizedRoadmap;
  if (!pr || pr.progress.total === 0) {
    return { content: "You don't have a roadmap yet — tell NEXA your goal on your profile and I'll build one.", actions: [{ type: "OPEN_PROFILE", label: "Set your goal" }] };
  }
  let content = `Your **${pr.title}** roadmap is ${pr.progress.pct}% complete (${pr.progress.completed} of ${pr.progress.total} steps).`;
  if (pr.currentPhase) content += `\n\nYou're currently in the **${pr.currentPhase}** phase.`;
  if (pr.nextStep) content += `\n\n**Your next step:** ${pr.nextStep.title}\n${pr.nextStep.description}`;
  else content += `\n\nEverything on your roadmap is complete — nice work.`;
  return { content, actions: [{ type: "VIEW_ROADMAP", label: "Open roadmap" }] };
}

const RULES = [
  { test: (m) => /who should i (talk|ask|reach)|who can help|should i ask/.test(m), run: (ctx) => respondNetwork(ctx) },
  { test: (m) => /compare.*saved|saved.*compare/.test(m), run: (ctx) => respondCompareSaved(ctx) },
  { test: (m) => /eligib|qualify|qualified/.test(m), run: (ctx) => respondEligibility(ctx) },
  { test: (m) => /which (opportunity|one)|best (opportunity|match)|prioriti[sz]e|fully funded|closes first|closes soonest/.test(m), run: (ctx, m) => respondPrioritizeOpportunity(ctx, m) },
  { test: (m) => /why is this my next step|complete .*faster|what should i learn next|find opportunities related|about my roadmap|my roadmap progress/.test(m), run: (ctx) => respondPersonalizedRoadmap(ctx) },
  { test: (m) => /30.day|30 day|this week|falling behind|what.*next|next step|smartest/.test(m), run: (ctx, m) => (/30.day|30 day|this week|falling behind/.test(m) ? respondRoadmapStatus(ctx, m) : respondNextStep(ctx)) },
  { test: (m) => /roadmap|prioriti[sz]e|plan/.test(m), run: (ctx, m) => respondRoadmapStatus(ctx, m) },
  { test: (m) => /strength|missing|gap|weak|skills should i|what am i/.test(m), run: (ctx, m) => respondProfile(ctx, m) },
  { test: (m) => /essay|sop|statement of purpose|email|write|review my|improve this/.test(m), run: (ctx, m) => respondApplicationSupport(m) },
];

export function generateMockResponse(message, context, isFirstMessage) {
  const m = (message || "").toLowerCase().trim();

  if (isFirstMessage && !m) {
    if (context.entryContext?.type === "network") {
      const res = respondNetwork(context);
      return { content: `You asked who could help. ${res.content}`, actions: res.actions };
    }
    if (context.entryContext?.type === "profile") {
      const res = respondNextStep(context);
      return { content: res.content, actions: res.actions };
    }
    const actions = [];
    if (context.currentOpportunity) actions.push({ type: "OPEN_OPPORTUNITY", label: "View opportunity", payload: { id: context.currentOpportunity.id } });
    if (context.currentMentor) actions.push({ type: "OPEN_MENTOR_PROFILE", label: "View profile", payload: { id: context.currentMentor.id } });
    return { content: greetingOpener(context), actions };
  }

  for (const rule of RULES) {
    if (rule.test(m)) return rule.run(context, m);
  }

  // Grounded fallback — never a generic "how can I help", uses whatever
  // context is actually available.
  if (context.user.goals.length > 0 || context.user.priorities.length > 0) {
    const goal = context.user.goals[0];
    const priority = context.user.priorities[0];
    let content = "";
    if (goal && priority) content = `You've already identified ${goal.toLowerCase()} as a goal and ${priority.toLowerCase()} as a priority.\n\nI'd start here:\n1. Review your strongest matched opportunities\n2. Compare funding options among your saved list\n3. Talk to someone who's already been through it\n\n`;
    else content = `Based on what you've told me so far, `;
    if (context.topOpportunities[0]) content += `Your strongest current match is **${context.topOpportunities[0].title}** at ${fmtPct(context.topOpportunities[0].match)}. Want me to walk through it?`;
    return { content, actions: context.topOpportunities[0] ? [{ type: "OPEN_OPPORTUNITY", label: "Open top match", payload: { id: context.topOpportunities[0].id } }] : [] };
  }

  return { content: "I don't have much of your profile yet, so I can't personalize this as much as I'd like. Tell me a bit about your goal, or complete your profile and I'll take it from there.", actions: [{ type: "OPEN_PROFILE", label: "Complete profile" }] };
}

export { greetingOpener };
