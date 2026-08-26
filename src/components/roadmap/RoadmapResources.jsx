import { useMemo } from "react";
import OpportunityCard from "../discover/OpportunityCard.jsx";
import MentorCard from "../network/MentorCard.jsx";
import { calculateMatchScore } from "../../lib/matching.js";
import { calculateMentorMatchScore } from "../../lib/mentorMatching.js";

// Real, matched catalog items for a phase — never fabricated. `resourceFocus`
// comes from the template (data/roadmapTemplates.js) and only ever narrows
// which real opportunities/mentors are eligible; matching itself always runs
// through the same deterministic engines the rest of the app uses.
export default function RoadmapResources({ resourceFocus, profile, opportunities, mentors }) {
  const matchedOpportunities = useMemo(() => {
    if (!resourceFocus || resourceFocus.kind !== "opportunity") return [];
    const pool = resourceFocus.types
      ? opportunities.filter((o) => resourceFocus.types.includes(o.type))
      : opportunities;
    return pool
      .filter((o) => o.verificationStatus === "PUBLISHED")
      .map((o) => ({ opportunity: o, match: calculateMatchScore(profile, o) }))
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
  }, [resourceFocus, opportunities, profile]);

  const matchedMentors = useMemo(() => {
    if (!resourceFocus || resourceFocus.kind !== "mentor") return [];
    return mentors
      .filter((m) => m && m.name)
      .map((m) => ({ mentor: m, match: calculateMentorMatchScore(profile, m) }))
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
  }, [resourceFocus, mentors, profile]);

  if (!resourceFocus) return null;

  const isMentor = resourceFocus.kind === "mentor";
  const items = isMentor ? matchedMentors : matchedOpportunities;

  return (
    <div className="mt-4 rounded-[var(--radius-md)] p-4" style={{ background: "var(--surface-muted)" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
        {isMentor ? "Matched mentors" : "Matched opportunities"}
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          {isMentor
            ? "No matched mentors yet — check back as more mentors join NEXA."
            : "No matching verified opportunities found yet."}
        </p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {isMentor
            ? matchedMentors.map(({ mentor }) => <MentorCard key={mentor.id} mentor={mentor} />)
            : matchedOpportunities.map(({ opportunity, match }) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} match={match} compact />
              ))}
        </div>
      )}
    </div>
  );
}
