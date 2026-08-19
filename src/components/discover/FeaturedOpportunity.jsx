import { useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import MatchScore from "./MatchScore.jsx";
import DeadlineBadge from "./DeadlineBadge.jsx";
import SaveButton from "./SaveButton.jsx";
import { getMatchReasons } from "../../lib/matching.js";

export default function FeaturedOpportunity({ opportunity, match, profile }) {
  const navigate = useNavigate();
  const reasons = getMatchReasons(profile, opportunity);

  return (
    <div className="nexa-panel rounded-[var(--radius-xl)] p-7 md:p-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Top match</Badge>
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{opportunity.type}</span>
          </div>
          <h2 className="font-display mt-3 text-[1.9rem] leading-tight md:text-[2.2rem]">{opportunity.title}</h2>
          <div className="mt-1 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{opportunity.organization} · {opportunity.location}</div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge>{opportunity.funding.type}</Badge>
            <DeadlineBadge deadline={opportunity.deadline} />
            {opportunity.categories.map((c) => <Badge key={c}>{c}</Badge>)}
          </div>

          <div className="mt-6">
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Why NEXA thinks this fits</div>
            <ul className="mt-2.5 space-y-1.5">
              {reasons.map((r) => (
                <li key={r} className="flex items-start gap-2 text-[13.5px]" style={{ color: "var(--text-primary)" }}>
                  <Check size={15} className="mt-0.5 shrink-0" style={{ color: "var(--success)" }} /> {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => navigate(`/discover/${opportunity.id}`)}>View opportunity</Button>
            <SaveButton id={opportunity.id} />
            <Button variant="ghost" icon={Sparkles} onClick={() => navigate("/nexa", { state: { entryContext: { type: "opportunity", id: opportunity.id } } })}>Ask NEXA about this</Button>
          </div>
        </div>

        <div className="shrink-0 self-center">
          <MatchScore value={match} size={92} />
        </div>
      </div>
    </div>
  );
}
