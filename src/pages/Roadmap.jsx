import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Sparkles } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useRoadmap } from "../context/RoadmapContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import RoadmapProgressBar from "../components/roadmap/RoadmapProgressBar.jsx";
import NextStepCard from "../components/roadmap/NextStepCard.jsx";
import PhaseBlock from "../components/roadmap/PhaseBlock.jsx";
import AskNexaRow from "../components/roadmap/AskNexaRow.jsx";
import RoadmapEmptyState from "../components/roadmap/RoadmapEmptyState.jsx";
import RoadmapSkeleton from "../components/roadmap/RoadmapSkeleton.jsx";
import RoadmapErrorState from "../components/roadmap/RoadmapErrorState.jsx";

export default function Roadmap() {
  const { roadmap, loaded, error, regenerating, needsUpdate, canGenerate, regenerate, setStepCompleted } = useRoadmap();
  const { opportunities } = useCatalog();
  const navigate = useNavigate();

  const defaultOpenPhaseId = useMemo(
    () => roadmap?.phases.find((p) => p.status === "in_progress")?.id || roadmap?.phases[0]?.id,
    [roadmap]
  );

  if (!loaded) return <RoadmapSkeleton />;

  if (error && !roadmap) {
    return <RoadmapErrorState message={error} onRetry={regenerate} />;
  }

  if (!roadmap || !canGenerate) {
    return <RoadmapEmptyState />;
  }

  const handleAskNexa = () => {
    if (!roadmap.nextAction) return;
    navigate("/nexa", { state: { entryContext: { type: "roadmap" }, seedMessage: "Why is this my next step?" } });
  };

  const handleContinue = () => {
    if (!roadmap.nextAction) return;
    const el = document.getElementById(`phase-${roadmap.nextAction.phaseId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-14 md:px-10">
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Your Roadmap</div>
            <h1 className="font-display mt-1 text-[2.2rem] md:text-[2.6rem]">{roadmap.title}</h1>
            <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{roadmap.description}</p>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={regenerate} disabled={regenerating}>
            {regenerating ? "Updating…" : "Update my roadmap"}
          </Button>
        </div>
      </Reveal>

      {needsUpdate && (
        <Reveal>
          <div className="nexa-card mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] p-4">
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Your profile has changed since this roadmap was generated.</p>
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={regenerate} disabled={regenerating}>Update now</Button>
          </div>
        </Reveal>
      )}

      {error && (
        <Reveal>
          <div className="mt-4 rounded-[var(--radius-md)] p-3 text-[12.5px]" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>{error}</div>
        </Reveal>
      )}

      <Reveal delay={60}>
        <div className="nexa-panel mt-7 rounded-[var(--radius-lg)] p-6">
          <RoadmapProgressBar completed={roadmap.progress.completed} total={roadmap.progress.total} pct={roadmap.progress.pct} />
        </div>
      </Reveal>

      <Reveal delay={100} className="mt-6">
        <NextStepCard nextAction={roadmap.nextAction} onContinue={handleContinue} onAskNexa={handleAskNexa} />
      </Reveal>

      <Reveal delay={140} className="mt-8">
        <AskNexaRow />
      </Reveal>

      <div className="mt-10">
        {roadmap.phases.map((phase, i) => (
          <div key={phase.id} id={`phase-${phase.id}`}>
            <PhaseBlock
              phase={phase}
              index={i}
              isLast={i === roadmap.phases.length - 1}
              catalogOpportunities={opportunities}
              onToggleStep={setStepCompleted}
              defaultOpen={phase.id === defaultOpenPhaseId}
            />
          </div>
        ))}
      </div>

      <Reveal className="mt-10">
        <div className="nexa-panel flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="anim-glow inline-block h-2 w-2 rounded-full" style={{ background: "var(--accent-strong)" }} />
            <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Have a question about any part of this plan?</p>
          </div>
          <Button variant="secondary" icon={Sparkles} onClick={() => navigate("/nexa", { state: { entryContext: { type: "roadmap" } } })}>Ask NEXA</Button>
        </div>
      </Reveal>
    </div>
  );
}
