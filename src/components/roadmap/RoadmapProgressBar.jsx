export default function RoadmapProgressBar({ completed, total, pct }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Your progress</span>
        <span className="font-display text-[1.3rem]">{pct}%</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-muted)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "var(--accent-strong)", transition: "width 700ms var(--ease-standard)" }}
        />
      </div>
      <div className="mt-1.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
        {completed} of {total} step{total === 1 ? "" : "s"} completed
      </div>
    </div>
  );
}
