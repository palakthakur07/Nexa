import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, X, ArrowUpRight } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import MatchRing from "../components/ui/MatchRing.jsx";
import DeadlineBadge from "../components/discover/DeadlineBadge.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useSaved, APPLICATION_STATUSES } from "../context/SavedContext.jsx";
import { OPPORTUNITIES } from "../data/opportunities.js";
import { calculateMatchScore } from "../lib/matching.js";

export default function Saved() {
  const { profile } = useProfile();
  const { saved, removeSaved, setStatus } = useSaved();
  const navigate = useNavigate();

  const items = useMemo(() => {
    return Object.entries(saved)
      .map(([id, record]) => {
        const opportunity = OPPORTUNITIES.find((o) => o.id === id);
        if (!opportunity) return null;
        return { opportunity, record, match: calculateMatchScore(profile, opportunity) };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.record.savedAt) - new Date(a.record.savedAt));
  }, [saved, profile]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <Reveal>
        <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Saved</div>
        <h1 className="font-display mt-2 text-[2.1rem]">Your saved opportunities</h1>
        <p className="mt-1 text-[14px]" style={{ color: "var(--text-secondary)" }}>Track status as you move through applications.</p>
      </Reveal>

      {items.length === 0 ? (
        <Reveal delay={80}>
          <div className="nexa-card mt-8 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] p-10 text-center">
            <Bookmark size={22} style={{ color: "var(--text-tertiary)" }} />
            <div className="text-[15px] font-semibold">No saved opportunities yet.</div>
            <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>NEXA will keep your shortlist here.</p>
            <Button variant="secondary" onClick={() => navigate("/discover")}>Browse opportunities</Button>
          </div>
        </Reveal>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map(({ opportunity, record, match }, i) => (
            <Reveal key={opportunity.id} delay={i * 60}>
              <div className="nexa-card rounded-[var(--radius-lg)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/discover/${opportunity.id}`)}>
                    <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{opportunity.type}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[14.5px] font-semibold">{opportunity.title} <ArrowUpRight size={13} style={{ color: "var(--text-tertiary)" }} /></div>
                    <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{opportunity.organization}</div>
                  </div>
                  <MatchRing value={match} size={38} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <DeadlineBadge deadline={opportunity.deadline} />
                  <select
                    value={record.status}
                    onChange={(e) => setStatus(opportunity.id, e.target.value)}
                    aria-label={`Application status for ${opportunity.title}`}
                    className="t-fast rounded-full px-3 py-1.5 text-[12px] font-semibold outline-none"
                    style={{ background: "var(--surface-muted)", color: "var(--accent-strong)", border: "1px solid var(--border)" }}
                  >
                    {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => removeSaved(opportunity.id)} className="t-fast ml-auto inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                    <X size={13} /> Remove
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
