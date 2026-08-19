export default function MatchRing({ value = 80, size = 40 }) {
  const r = (size - 7) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-muted)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent-strong)" strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={c - (value / 100) * c} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 700ms var(--ease-standard)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{value}%</div>
    </div>
  );
}
