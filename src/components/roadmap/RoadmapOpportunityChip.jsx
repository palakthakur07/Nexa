import { useNavigate } from "react-router-dom";
import MatchRing from "../ui/MatchRing.jsx";
import DeadlineBadge from "../discover/DeadlineBadge.jsx";
import SaveButton from "../discover/SaveButton.jsx";
import { OpportunityVerificationBadge } from "../ui/VerificationBadge.jsx";

// A smaller cousin of OpportunityCard, sized for sitting inside a roadmap
// step rather than a grid. Always real, verified catalog data — never
// invented (see roadmapEngine.js#matchOpportunitiesForPhase).
export default function RoadmapOpportunityChip({ opportunity, match }) {
  const navigate = useNavigate();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/discover/${opportunity.id}`)}
      onKeyDown={(e) => { if (e.key === "Enter") navigate(`/discover/${opportunity.id}`); }}
      className="nexa-card t-fast cursor-pointer rounded-[var(--radius-md)] p-3.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{opportunity.type}</div>
          <div className="mt-0.5 truncate text-[13.5px] font-semibold leading-snug">{opportunity.title}</div>
          <div className="truncate text-[11.5px]" style={{ color: "var(--text-secondary)" }}>{opportunity.organization}</div>
          <div className="mt-1"><OpportunityVerificationBadge status={opportunity.verificationStatus} /></div>
        </div>
        <MatchRing value={match} size={32} />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <DeadlineBadge deadline={opportunity.deadline} />
        <div onClick={(e) => e.stopPropagation()}><SaveButton id={opportunity.id} size="sm" /></div>
      </div>
    </div>
  );
}
