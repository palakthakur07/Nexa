export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>
      <span className="anim-glow inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-strong)" }} />
      NEXA is thinking…
    </div>
  );
}
