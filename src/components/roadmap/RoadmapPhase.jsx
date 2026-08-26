import { Check, Lock } from "lucide-react";
import RoadmapResources from "./RoadmapResources.jsx";
import { phaseStatus } from "../../lib/roadmapEngine.js";

const STATUS_LABEL = { completed: "Completed", in_progress: "In progress", locked: "Locked", upcoming: "Upcoming" };

function StepRow({ step, onToggle }) {
  const done = step.status === "completed";
  const current = step.status === "in_progress";
  return (
    <button
      onClick={onToggle}
      className="t-fast flex w-full items-start gap-3 rounded-[var(--radius-md)] px-2 py-2.5 text-left hover:bg-[var(--surface-muted)]"
    >
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
        style={{
          background: done ? "var(--success-soft)" : "transparent",
          borderColor: done ? "var(--success)" : current ? "var(--accent-strong)" : "var(--border-strong)",
        }}
      >
        {done && <Check size={11} style={{ color: "var(--success)" }} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className="text-[13.5px] font-semibold"
            style={{ color: done ? "var(--text-tertiary)" : "var(--text-primary)", textDecoration: done ? "line-through" : "none" }}
          >
            {step.title}
          </span>
          {current && <span className="text-[10.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>NOW</span>}
        </span>
        <span className="mt-0.5 block text-[12.5px] leading-snug" style={{ color: "var(--text-secondary)" }}>{step.description}</span>
        <span className="mt-1 block text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>{step.effort}</span>
      </span>
    </button>
  );
}

export default function RoadmapPhase({ phase, index, onToggleStep, profile, opportunities, mentors }) {
  const status = phaseStatus(phase);
  const locked = status === "locked";

  return (
    <div className="relative pl-10">
      {/* timeline node */}
      <span
        className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
        style={{
          background: status === "completed" ? "var(--success-soft)" : status === "in_progress" ? "var(--accent-soft)" : "var(--surface-muted)",
          color: status === "completed" ? "var(--success)" : status === "in_progress" ? "var(--accent-strong)" : "var(--text-tertiary)",
        }}
      >
        {status === "completed" ? <Check size={13} /> : locked ? <Lock size={11} /> : String(index + 1).padStart(2, "0")}
      </span>

      <div className="nexa-card rounded-[var(--radius-lg)] p-5" style={{ opacity: locked ? 0.75 : 1 }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-display text-[1.15rem]">{phase.title}</div>
            <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>{phase.description}</p>
          </div>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
            style={{
              background: status === "completed" ? "var(--success-soft)" : status === "in_progress" ? "var(--accent-soft)" : "var(--surface-muted)",
              color: status === "completed" ? "var(--success)" : status === "in_progress" ? "var(--accent-strong)" : "var(--text-tertiary)",
            }}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>

        <div className="mt-3" style={{ borderTop: "1px solid var(--border)" }}>
          {phase.steps.map((step) => (
            <div key={step.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <StepRow step={step} onToggle={() => onToggleStep(phase.id, step.id)} />
            </div>
          ))}
        </div>

        {phase.resourceFocus && (
          <RoadmapResources resourceFocus={phase.resourceFocus} profile={profile} opportunities={opportunities} mentors={mentors} />
        )}
      </div>
    </div>
  );
}
