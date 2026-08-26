import { Check, Lock, Circle } from "lucide-react";

const STATUS_STYLE = {
  completed: { bg: "var(--success-soft)", fg: "var(--success)" },
  in_progress: { bg: "var(--accent-soft)", fg: "var(--accent-strong)" },
  upcoming: { bg: "var(--surface-muted)", fg: "var(--text-tertiary)" },
  locked: { bg: "var(--surface-muted)", fg: "var(--text-tertiary)" },
};

function StatusIcon({ status }) {
  if (status === "completed") return <Check size={13} />;
  if (status === "locked") return <Lock size={11} />;
  return <Circle size={8} fill="currentColor" />;
}

export default function StepRow({ step, onToggle }) {
  const style = STATUS_STYLE[step.status];
  const locked = step.status === "locked";
  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${step.status === "in_progress" ? "anim-glow" : ""}`}
        style={{ background: style.bg, color: style.fg }}
      >
        <StatusIcon status={step.status} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[13.5px] font-semibold leading-snug"
            style={{ color: locked ? "var(--text-tertiary)" : "var(--text-primary)", textDecoration: step.status === "completed" ? "none" : "none" }}
          >
            {step.title}
          </span>
          {step.effort && (
            <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: "var(--surface-muted)", color: "var(--text-tertiary)" }}>
              {step.effort}
            </span>
          )}
        </div>
        {!locked && (
          <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.description}</p>
        )}
        {!locked && (
          <button
            onClick={() => onToggle(step.id, !step.completed)}
            className="t-fast mt-1.5 text-[12px] font-semibold"
            style={{ color: step.completed ? "var(--text-tertiary)" : "var(--accent-strong)" }}
          >
            {step.completed ? "Reopen" : "Mark complete"}
          </button>
        )}
      </div>
    </div>
  );
}
