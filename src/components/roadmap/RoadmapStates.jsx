import { Sparkles, RotateCcw } from "lucide-react";
import Button from "../ui/Button.jsx";

export function RoadmapEmptyState({ onBuild, building }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}>
        <Sparkles size={22} style={{ color: "var(--accent-strong)" }} />
      </div>
      <h1 className="font-display mt-5 text-[2rem]">Let's build your roadmap.</h1>
      <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Tell NEXA what you're working toward and we'll create a personalized path for you — phase by phase, with real opportunities along the way.
      </p>
      <div className="mt-6">
        <Button variant="primary" onClick={onBuild} disabled={building}>{building ? "Building your roadmap…" : "Build my roadmap"}</Button>
      </div>
    </div>
  );
}

export function RoadmapSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-6 py-14">
      <div className="h-3 w-24 rounded-full" style={{ background: "var(--surface-muted)" }} />
      <div className="mt-3 h-9 w-72 rounded-full" style={{ background: "var(--surface-muted)" }} />
      <div className="mt-6 h-24 rounded-[var(--radius-lg)]" style={{ background: "var(--surface-muted)" }} />
      <div className="mt-10 space-y-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-[var(--radius-lg)]" style={{ background: "var(--surface-muted)" }} />
        ))}
      </div>
    </div>
  );
}

export function RoadmapErrorState({ onRetry }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <h1 className="font-display text-[1.7rem]">We couldn't update your roadmap right now.</h1>
      <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Nothing was lost — try again.</p>
      <div className="mt-5"><Button variant="secondary" icon={RotateCcw} onClick={onRetry}>Try again</Button></div>
    </div>
  );
}
