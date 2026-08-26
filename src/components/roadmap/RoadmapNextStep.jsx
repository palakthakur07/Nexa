import { ArrowRight, Sparkles } from "lucide-react";
import Button from "../ui/Button.jsx";

// Derived, never invented — nextStep is the earliest "in_progress" step
// found by roadmapEngine.getNextStep(). If everything's done, celebrate
// quietly instead of showing a broken/empty card.
export default function RoadmapNextStep({ nextStep, onComplete, onAskNexa }) {
  if (!nextStep) {
    return (
      <div className="nexa-panel rounded-[var(--radius-lg)] p-6 text-center">
        <p className="font-display text-[1.3rem]">You've completed every step.</p>
        <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>
          Update your goals to get a new plan, or keep exploring opportunities.
        </p>
      </div>
    );
  }

  const { phase, step } = nextStep;

  return (
    <div className="nexa-panel rounded-[var(--radius-lg)] p-6">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
        <Sparkles size={13} /> Your next step
      </div>
      <div className="mt-2 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-[1.35rem] leading-snug">{step.title}</p>
          <p className="mt-1 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{step.description}</p>
          <p className="mt-1.5 text-[11.5px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            {phase.title} · {step.effort}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onAskNexa}>Ask NEXA</Button>
          <Button variant="primary" size="sm" icon={ArrowRight} iconRight onClick={onComplete}>Mark complete</Button>
        </div>
      </div>
    </div>
  );
}
