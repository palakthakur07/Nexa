import { Reveal } from "../../lib/hooks.jsx";

// Vertical timeline, revealed step by step on scroll — deliberately not a
// chart; this is a story, not a metric.
export default function JourneyTimeline({ steps }) {
  return (
    <div className="relative">
      <div className="absolute bottom-3 left-[15px] top-3 w-px" style={{ background: "var(--border)" }} />
      {steps.map((step, i) => (
        <Reveal key={step} delay={i * 90} className="relative flex items-center gap-4 pb-6 last:pb-0">
          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: i === steps.length - 1 ? "var(--accent-strong)" : "var(--surface)", color: i === steps.length - 1 ? "#fff" : "var(--text-tertiary)", border: `1px solid ${i === steps.length - 1 ? "var(--accent-strong)" : "var(--border-strong)"}` }}>
            {i + 1}
          </div>
          <span className="text-[14px] font-medium">{step}</span>
        </Reveal>
      ))}
    </div>
  );
}
