import { useNavigate } from "react-router-dom";
import { RefreshCcw, Sparkles } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useRoadmap } from "../context/RoadmapContext.jsx";
import RoadmapProgress from "../components/roadmap/RoadmapProgress.jsx";
import RoadmapNextStep from "../components/roadmap/RoadmapNextStep.jsx";
import RoadmapPhase from "../components/roadmap/RoadmapPhase.jsx";
import RoadmapAddedItems from "../components/roadmap/RoadmapAddedItems.jsx";
import { RoadmapEmptyState, RoadmapSkeleton, RoadmapErrorState } from "../components/roadmap/RoadmapStates.jsx";

export default function Roadmap() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { opportunities, mentors } = useCatalog();
  const { roadmap, loading, saving, error, stale, progress, nextStep, generate, regenerate, toggleStep } = useRoadmap();

  if (loading) return <RoadmapSkeleton />;
  if (error && !roadmap) return <RoadmapErrorState onRetry={generate} />;
  if (!roadmap) return <RoadmapEmptyState onBuild={generate} building={saving} />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <Reveal>
        <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
          /Roadmap
        </div>
        <h1 className="font-display mt-1 text-[2.2rem] leading-tight md:text-[2.6rem]">{roadmap.title}</h1>
        <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {roadmap.description}
        </p>
      </Reveal>

      {stale && (
        <Reveal>
          <div className="nexa-card mt-5 flex flex-col items-start justify-between gap-3 rounded-[var(--radius-md)] p-4 sm:flex-row sm:items-center" style={{ borderColor: "var(--accent)" }}>
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              Your goals or interests have changed since this roadmap was built.
            </p>
            <Button variant="secondary" size="sm" icon={RefreshCcw} onClick={regenerate} disabled={saving}>
              Update my roadmap
            </Button>
          </div>
        </Reveal>
      )}

      <Reveal className="mt-8">
        <RoadmapProgress {...progress} />
      </Reveal>

      <Reveal className="mt-6">
        <RoadmapNextStep
          nextStep={nextStep}
          onComplete={() => nextStep && toggleStep(nextStep.phase.id, nextStep.step.id)}
          onAskNexa={() => navigate("/nexa", { state: { entryContext: { type: "roadmap" } } })}
        />
      </Reveal>

      <div className="mt-10 space-y-6">
        {roadmap.phases.map((phase, i) => (
          <Reveal key={phase.id} delay={i * 40}>
            <RoadmapPhase
              phase={phase}
              index={i}
              onToggleStep={toggleStep}
              profile={profile}
              opportunities={opportunities}
              mentors={mentors}
            />
          </Reveal>
        ))}

        {profile.customRoadmapItems?.length > 0 && (
          <Reveal><RoadmapAddedItems items={profile.customRoadmapItems} /></Reveal>
        )}
      </div>

      <Reveal className="mt-10">
        <div className="nexa-panel flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Not quite right?</div>
            <p className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
              Update your goals in your profile, then rebuild your roadmap around them.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>Edit profile</Button>
            <Button variant="secondary" size="sm" icon={RefreshCcw} onClick={regenerate} disabled={saving}>Rebuild roadmap</Button>
          </div>
        </div>
      </Reveal>

      {error && (
        <p className="mt-4 text-center text-[12.5px]" style={{ color: "var(--warning)" }}>{error}</p>
      )}
    </div>
  );
}
