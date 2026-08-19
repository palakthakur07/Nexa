export default function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "var(--surface-muted)", fg: "var(--accent-strong)" },
    accent: { bg: "var(--accent)", fg: "var(--text-on-accent)" },
    success: { bg: "var(--success-soft)", fg: "var(--success)" },
  }[tone];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: tones.bg, color: tones.fg }}>
      {children}
    </span>
  );
}
