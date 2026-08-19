export default function NetworkHero({ profile, matchCount }) {
  const goal = profile.goals[0] || "your next step";
  const focus = profile.interests.slice(0, 2).join(" + ") || null;

  return (
    <div className="mb-10">
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Women who've been there</div>
      <h1 className="font-display mt-2 text-[2.1rem] md:text-[2.4rem]">Who could help you?</h1>
      <p className="mt-2 max-w-xl text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Find women who've already navigated the path you're exploring.
      </p>
      <div className="nexa-card mt-5 inline-flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[var(--radius-md)] px-5 py-3.5 text-[13px]">
        <span><span style={{ color: "var(--text-tertiary)" }}>You're exploring</span> <b>{focus ? `${focus} · ${goal}` : goal}</b></span>
        <span><span style={{ color: "var(--text-tertiary)" }}>NEXA found</span> <b>{matchCount} women with relevant experience</b></span>
      </div>
    </div>
  );
}
