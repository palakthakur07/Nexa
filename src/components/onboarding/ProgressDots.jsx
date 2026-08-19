export default function ProgressDots({ index, total }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className="h-1.5 rounded-full t-standard" style={{ width: i === index ? 18 : 6, background: i <= index ? "var(--accent-strong)" : "var(--border)" }} />
        ))}
      </div>
      <span className="text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}
