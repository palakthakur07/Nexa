import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Check, Sparkles } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import MatchScore from "../components/discover/MatchScore.jsx";
import MatchBreakdown from "../components/discover/MatchBreakdown.jsx";
import DeadlineBadge from "../components/discover/DeadlineBadge.jsx";
import SaveButton from "../components/discover/SaveButton.jsx";
import EligibilitySection from "../components/discover/EligibilitySection.jsx";
import ApplicationSteps from "../components/discover/ApplicationSteps.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { calculateMatchScore, getMatchBreakdown, getMatchReasons } from "../lib/matching.js";
import { deadlineStatus, formatDeadline } from "../lib/deadline.js";

function nexaTake(profile, opportunity, match) {
  const status = deadlineStatus(opportunity.deadline);
  const urgent = status.days >= 0 && status.days <= 14;
  if (match >= 80 && urgent) return "This is worth prioritizing.";
  if (match >= 80) return "A strong fit worth setting time aside for.";
  if (urgent) return "The deadline is close — worth a quick look even if it's not a top match.";
  return "Worth reviewing when you have a moment.";
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, addRoadmapItem } = useProfile();
  const { opportunities, loading } = useCatalog();
  const [addedToRoadmap, setAddedToRoadmap] = useState(false);

  const opportunity = opportunities.find((o) => o.id === id);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-6">
        <div className="anim-spin-slow h-8 w-8 rounded-full" style={{ border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-[1.8rem]">Opportunity not found</h1>
        <p className="mt-2 text-[14px]" style={{ color: "var(--text-secondary)" }}>It may have been removed, or the link is out of date.</p>
        <button onClick={() => navigate("/discover")} className="t-fast mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>
          <ArrowLeft size={15} /> Back to Discover
        </button>
      </div>
    );
  }

  const match = calculateMatchScore(profile, opportunity);
  const breakdown = getMatchBreakdown(profile, opportunity);
  const reasons = getMatchReasons(profile, opportunity);
  const status = deadlineStatus(opportunity.deadline);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <button onClick={() => navigate("/discover")} className="t-fast inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft size={14} /> Back to Discover
      </button>

      <Reveal delay={40}>
        <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{opportunity.type}</span>
              {opportunity.verified && <Badge tone="success">Verified</Badge>}
            </div>
            <h1 className="font-display mt-2 text-[2.1rem] leading-tight md:text-[2.4rem]">{opportunity.title}</h1>
            <div className="mt-1 text-[14px]" style={{ color: "var(--text-secondary)" }}>{opportunity.organization} · {opportunity.location}</div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge>{opportunity.funding.type}</Badge>
              <DeadlineBadge deadline={opportunity.deadline} />
              <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Deadline · {formatDeadline(opportunity.deadline)}</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a href={opportunity.applicationUrl} target="_blank" rel="noreferrer">
                <Button variant="primary" icon={ExternalLink} iconRight>Apply / Visit opportunity</Button>
              </a>
              <SaveButton id={opportunity.id} />
              <Button variant="ghost" icon={Sparkles} onClick={() => navigate("/nexa", { state: { entryContext: { type: "opportunity", id: opportunity.id } } })}>Ask NEXA about this</Button>
            </div>
          </div>
          <MatchScore value={match} size={80} />
        </div>
      </Reveal>

      <Reveal delay={100} className="mt-10">
        <h2 className="font-display text-[1.4rem]">Overview</h2>
        <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{opportunity.description}</p>
      </Reveal>

      <Reveal delay={140} className="mt-10">
        <h2 className="font-display text-[1.4rem]">Why it matches you</h2>
        <div className="nexa-panel mt-4 rounded-[var(--radius-lg)] p-6">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Why NEXA recommends this</div>
          <div className="font-display text-[1.7rem]">{match}% match</div>
          <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Based on the profile you gave NEXA, this opportunity aligns with:
          </p>
          <ul className="mt-2 space-y-1.5">
            {reasons.map((r) => (
              <li key={r} className="flex items-start gap-2 text-[13.5px]"><Check size={15} className="mt-0.5 shrink-0" style={{ color: "var(--success)" }} /> {r}</li>
            ))}
          </ul>
          <div className="mt-5"><MatchBreakdown breakdown={breakdown} /></div>
        </div>
      </Reveal>

      <Reveal delay={180} className="mt-10">
        <h2 className="font-display text-[1.4rem]">Eligibility</h2>
        <div className="mt-4"><EligibilitySection eligibility={opportunity.eligibility} profile={profile} /></div>
      </Reveal>

      <Reveal delay={220} className="mt-10">
        <h2 className="font-display text-[1.4rem]">Benefits</h2>
        <ul className="mt-3 space-y-1.5">
          {opportunity.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13.5px]"><Check size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent-strong)" }} /> {b}</li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={260} className="mt-10">
        <h2 className="font-display text-[1.4rem]">Funding</h2>
        <div className="nexa-card mt-3 rounded-[var(--radius-md)] p-4">
          <div className="text-[14px] font-semibold">{opportunity.funding.type}</div>
          {opportunity.funding.amount && <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{opportunity.funding.amount}</div>}
        </div>
      </Reveal>

      <Reveal delay={300} className="mt-10">
        <h2 className="font-display text-[1.4rem]">Timeline</h2>
        <div className="nexa-card mt-3 flex items-center justify-between rounded-[var(--radius-md)] p-4">
          <span className="text-[13.5px] font-medium">Application deadline</span>
          <span className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>{formatDeadline(opportunity.deadline)} · {status.label}</span>
        </div>
      </Reveal>

      <Reveal delay={340} className="mt-10">
        <h2 className="font-display text-[1.4rem]">How to apply</h2>
        <div className="mt-4"><ApplicationSteps /></div>
      </Reveal>

      <Reveal delay={380} className="my-10">
        <h2 className="font-display text-[1.4rem]">Nexa's take</h2>
        <div className="nexa-panel mt-4 rounded-[var(--radius-lg)] p-6">
          <p className="font-display text-[1.3rem]">{nexaTake(profile, opportunity, match)}</p>
          <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {reasons[0] ? `${reasons[0]}${status.days >= 0 && status.days <= 14 ? ", and the deadline is approaching." : "."}` : "Based on what you've told NEXA so far."}
          </p>
          <div className="mt-4">
            <Button
              variant={addedToRoadmap ? "secondary" : "primary"} icon={addedToRoadmap ? Check : undefined}
              onClick={() => { addRoadmapItem(`Apply to ${opportunity.title}`); setAddedToRoadmap(true); }}
              disabled={addedToRoadmap}
            >
              {addedToRoadmap ? "Added to roadmap" : "Add to roadmap"}
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}



