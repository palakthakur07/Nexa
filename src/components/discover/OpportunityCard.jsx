import { useNavigate } from "react-router-dom";
import Badge from "../ui/Badge.jsx";
import MatchRing from "../ui/MatchRing.jsx";
import DeadlineBadge from "./DeadlineBadge.jsx";
import SaveButton from "./SaveButton.jsx";

// Used by both Discover's grid and the Dashboard's "Opportunities for you"
// section — one component, one data source, so the two stay in sync.
export default function OpportunityCard({ opportunity, match, compact = false }) {
  const navigate = useNavigate();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/discover/${opportunity.id}`)}
      onKeyDown={(e) => { if (e.key === "Enter") navigate(`/discover/${opportunity.id}`); }}
      className="nexa-card t-standard cursor-pointer rounded-[var(--radius-lg)] p-5 hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{opportunity.type}</div>
          <div className="mt-0.5 text-[14.5px] font-semibold leading-snug">{opportunity.title}</div>
          <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{opportunity.organization} · {opportunity.location}</div>
        </div>
        <MatchRing value={match} size={40} />
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {opportunity.categories.slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] font-medium" style={{ color: "var(--text-secondary)" }}>{opportunity.funding.type}</span>
          <DeadlineBadge deadline={opportunity.deadline} />
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <SaveButton id={opportunity.id} size="sm" />
        </div>
      </div>
    </div>
  );
}
