import { ArrowRight, Sparkles } from "lucide-react";
import Button from "../ui/Button.jsx";

export default function NextStepCard({ nextAction, onContinue, onAskNexa }) {
  if (!nextAction) {
    return (
      <div className="nexa-panel rounded-[var(--radius-lg)] p-6 text-center">
        <p className="font-display text-[1.3rem]">You've completed every step.</p>
        <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Nice work — update your goal any time to keep growing.</p>
      </div>
    );
  }
  return (
    <div className="nexa-panel rounded-[var(--radius-lg)] p-6">
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
        Your next step · {nextAction.phaseTitle}
      </div>
      <p className="font-display mt-1.5 text-[1.5rem] leading-tight">{nextAction.title}</p>
      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{nextAction.description}</p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button variant="primary" icon={ArrowRight} iconRight onClick={onContinue}>Continue</Button>
        <Button variant="secondary" icon={Sparkles} onClick={onAskNexa}>Ask NEXA about this</Button>
      </div>
    </div>
  );
}
