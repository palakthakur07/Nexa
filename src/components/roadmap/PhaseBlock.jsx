import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Lock, Users } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import StepRow from "./StepRow.jsx";
import RoadmapOpportunityChip from "./RoadmapOpportunityChip.jsx";

const DOT_STYLE = {
  completed: { bg: "var(--success)", fg: "#fff" },
  in_progress: { bg: "var(--accent-strong)", fg: "#fff" },
  upcoming: { bg: "var(--surface)", fg: "var(--text-tertiary)" },
  locked: { bg: "var(--surface)", fg: "var(--text-tertiary)" },
};

export default function PhaseBlock({ phase, index, isLast, catalogOpportunities, onToggleStep, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const navigate = useNavigate();
  const dot = DOT_STYLE[phase.status];
  const locked = phase.status === "locked";

  const resolvedOpportunities = (phase.opportunities || [])
    .map(({ id, match }) => {
      const opp = catalogOpportunities.find((o) => o.id === id);
      return opp ? { opportunity: opp, match } : null;
    })
    .filter(Boolean);

  const showOpportunitySection = phase.find?.phase === true;
  const showNetworkCta = phase.find && phase.find.phase === false;

  return (
    <div className="flex gap-4">
      {/* Timeline rail */}
      <div className="flex flex-col items-center">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
          style={{ background: dot.bg, color: dot.fg, boxShadow: phase.status === "in_progress" ? "0 0 0 4px var(--accent-soft)" : "none" }}
        >
          {phase.status === "completed" ? <Check size={15} /> : locked ? <Lock size={13} /> : String(index + 1).padStart(2, "0")}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1" style={{ background: "var(--border)", minHeight: 24 }} />}
      </div>

      {/* Phase content */}
      <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-8"}`}>
        <button onClick={() => setOpen((o) => !o)} className="t-fast flex w-full items-start justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[1.25rem] leading-tight" style={{ color: locked ? "var(--text-tertiary)" : "var(--text-primary)" }}>{phase.title}</h3>
              {phase.status === "in_progress" && <Badge tone="accent">In progress</Badge>}
              {phase.status === "completed" && <Badge tone="success">Completed</Badge>}
            </div>
            <p className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>{phase.description}</p>
          </div>
          <ChevronDown size={18} className="t-fast mt-1 shrink-0" style={{ color: "var(--text-tertiary)", transform: open ? "rotate(180deg)" : "none" }} />
        </button>

        {open && (
          <div className="mt-3 nexa-card rounded-[var(--radius-lg)] p-4 sm:p-5">
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {phase.steps.map((step) => (
                <StepRow key={step.id} step={step} onToggle={(stepId, completed) => onToggleStep(phase.id, stepId, completed)} />
              ))}
            </div>

            {showOpportunitySection && (
              <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
                  {resolvedOpportunities.length > 0
                    ? `NEXA found ${resolvedOpportunities.length} verified opportunit${resolvedOpportunities.length === 1 ? "y" : "ies"} matching your profile`
                    : "Verified opportunities"}
                </div>
                {resolvedOpportunities.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {resolvedOpportunities.map(({ opportunity, match }) => (
                      <RoadmapOpportunityChip key={opportunity.id} opportunity={opportunity} match={match} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>No matching verified opportunities found yet.</p>
                )}
                <button onClick={() => navigate("/discover")} className="t-fast mt-3 text-[12.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>
                  Explore all opportunities →
                </button>
              </div>
            )}

            {showNetworkCta && (
              <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
                <Button variant="secondary" size="sm" icon={Users} onClick={() => navigate("/network")}>Browse the network</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
