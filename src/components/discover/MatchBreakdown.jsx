export default function MatchBreakdown({ breakdown }) {
  return (
    <div className="space-y-2.5">
      {breakdown.map((b) => (
        <div key={b.label}>
          <div className="mb-1 flex items-center justify-between text-[12px]" style={{ color: "var(--text-secondary)" }}>
            <span>{b.label}</span><span className="font-semibold" style={{ color: "var(--text-primary)" }}>{b.value}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-muted)" }}>
            <div className="h-full rounded-full" style={{ width: `${b.value}%`, background: "var(--accent-strong)", transition: "width 700ms var(--ease-standard)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
