import { ArrowLeft } from "lucide-react";
import ProgressDots from "./ProgressDots.jsx";

export default function OnboardingLayout({ stepIndex, total, onBack, onSkip, canSkip, children }) {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        {stepIndex > 0 ? (
          <button onClick={onBack} className="t-fast inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft size={14} /> Back
          </button>
        ) : <span />}
        <ProgressDots index={stepIndex} total={total} />
      </div>
      <div key={stepIndex} className="reveal in">{children}</div>
      {canSkip && (
        <button onClick={onSkip} className="t-fast mt-6 self-center text-[12.5px] font-medium" style={{ color: "var(--text-tertiary)" }}>
          Skip this step
        </button>
      )}
    </div>
  );
}
