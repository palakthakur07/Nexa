import Badge from "../ui/Badge.jsx";

export default function DiscoverHeader({ profile }) {
  const focus = profile.interests.slice(0, 2).join(" + ") || "Not set yet";
  const goal = profile.goals[0] || "Not set yet";

  return (
    <div className="mb-8">
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Discover</div>
      <h1 className="font-display mt-2 text-[2rem] md:text-[2.4rem]">Opportunities that make sense for you.</h1>
      <p className="mt-2 max-w-xl text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Based on your goals, interests, skills and priorities, NEXA narrowed these down.
      </p>
      <div className="nexa-card mt-5 inline-flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[var(--radius-md)] px-5 py-3.5 text-[13px]">
        <span><span style={{ color: "var(--text-tertiary)" }}>For</span> <b>{profile.name || "you"}</b></span>
        <span><span style={{ color: "var(--text-tertiary)" }}>Goal</span> <b>{goal}</b></span>
        <span><span style={{ color: "var(--text-tertiary)" }}>Focus</span> <b>{focus}</b></span>
        {!profile.onboardingComplete && <Badge tone="accent">Complete onboarding for better matches</Badge>}
      </div>
    </div>
  );
}
