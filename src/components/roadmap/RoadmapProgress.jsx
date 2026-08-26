// A slim, deliberate progress bar — the roadmap's one numeric "how far
// along am I" signal. Value always comes from computeProgress() in
// roadmapEngine.js, never hardcoded.
export default function RoadmapProgress({ completed, total, pct }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px]" style={{ color: "var(--text-secondary)" }}>
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Your progress</span>
        <span>{completed} of {total} steps completed</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-muted)" }}>
        <div
          className="t-standard h-full rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-strong))" }}
        />
      </div>
    </div>
  );
}
