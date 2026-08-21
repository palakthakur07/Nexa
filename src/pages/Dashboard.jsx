import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, ArrowUpRight } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import WomanCard from "../components/network/WomanCard.jsx";
import OpportunityCard from "../components/discover/OpportunityCard.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { COMMUNITIES } from "../data/communities.js";
import { calculateMatchScore } from "../lib/matching.js";
import { calculateWomanMatchScore } from "../lib/womanMatching.js";
import { getNextMove, generateRoadmap } from "../lib/scoring.js";

export default function Dashboard() {
  const { profile } = useProfile();
  const { opportunities, mentors } = useCatalog();
  const navigate = useNavigate();

  // Same data + same matching engine as /discover (lib/matching.js), so
  // the dashboard's "top picks" and the full Discover results never drift
  // out of sync with each other.
  const topOpportunities = useMemo(
    () => opportunities.map((o) => ({ opportunity: o, match: calculateMatchScore(profile, o) })).sort((a, b) => b.match - a.match).slice(0, 3),
    [profile, opportunities]
  );
  // Same principle for the women network (lib/womanMatching.js, Phase 4).
  const topWomen = useMemo(
    () => mentors.map((w) => ({ woman: w, match: calculateWomanMatchScore(profile, w) })).sort((a, b) => b.match - a.match).slice(0, 3),
    [profile, mentors]
  );
  const nextMove = useMemo(() => getNextMove(profile), [profile]);
  const roadmap = useMemo(() => generateRoadmap(profile), [profile]);
  const progressPct = Math.round((roadmap.filter((r) => r.status === "done").length / roadmap.length) * 100);
  const strongMatches = topOpportunities.filter((o) => o.match >= 80).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 md:px-10">
      <Reveal>
        <h1 className="font-display text-[2.2rem] md:text-[2.6rem]">Good morning, {profile.name || "there"}.</h1>
        <p className="mt-2 text-[14.5px]" style={{ color: "var(--text-secondary)" }}>
          Here's what NEXA found for you.
        </p>
      </Reveal>

      <DashboardSection eyebrow="Your next move" title={nextMove.title}>
        <div className="nexa-panel flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] p-6 sm:flex-row sm:items-center">
          <p className="max-w-md text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{nextMove.why}</p>
          <Button variant="primary" onClick={() => navigate("/discover")}>Continue</Button>
        </div>
      </DashboardSection>

      <DashboardSection eyebrow="Opportunities" title="Opportunities for you" action={<button onClick={() => navigate("/discover")} className="t-fast text-[13px] font-semibold" style={{ color: "var(--accent-strong)" }}>See all opportunities</button>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topOpportunities.map(({ opportunity, match }) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} match={match} compact />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection eyebrow="Community" title="Women who've been there" action={<button onClick={() => navigate("/network")} className="t-fast text-[13px] font-semibold" style={{ color: "var(--accent-strong)" }}>Meet more women</button>}>
        <div className="grid gap-4 sm:grid-cols-3">
          {topWomen.map(({ woman, match }) => <WomanCard key={woman.id} woman={woman} match={match} />)}
        </div>
      </DashboardSection>

      <DashboardSection eyebrow="Progress" title="Your roadmap" action={<span className="font-display text-[1.4rem]">{progressPct}%</span>}>
        <div className="nexa-card rounded-[var(--radius-lg)] p-6">
          {roadmap.map((r, i) => (
            <div key={r.label} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < roadmap.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: r.status === "done" ? "var(--success-soft)" : r.status === "now" ? "var(--accent-soft)" : "var(--surface-muted)", color: r.status === "done" ? "var(--success)" : r.status === "now" ? "var(--accent-strong)" : "var(--text-tertiary)" }}>
                {r.status === "done" ? <Check size={12} /> : String(i + 1).padStart(2, "0")}
              </div>
              <span className="text-[13.5px] font-medium" style={{ color: r.status === "later" ? "var(--text-tertiary)" : "var(--text-primary)" }}>{r.label}</span>
              {r.status === "now" && <Badge tone="accent">Now</Badge>}
            </div>
          ))}
        </div>
      </DashboardSection>

      <div className="mb-14 grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Nexa</div>
          <div className="nexa-panel mt-3 rounded-[var(--radius-lg)] p-5">
            <div className="flex items-center gap-2"><span className="anim-glow inline-block h-2 w-2 rounded-full" style={{ background: "var(--accent-strong)" }} /><span className="text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>Active</span></div>
            <p className="font-display mt-2 text-[15.5px]">I found {strongMatches || topOpportunities.length} opportunities that fit what you're looking for.</p>
            <Button variant="secondary" size="sm" icon={Sparkles} onClick={() => navigate("/nexa")}>Ask Nexa</Button>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Communities</div>
          <div className="nexa-card mt-3 space-y-2.5 rounded-[var(--radius-lg)] p-5">
            {COMMUNITIES.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div><div className="text-[13px] font-semibold">{c.name}</div><div className="text-[11.5px]" style={{ color: "var(--text-secondary)" }}>{c.category}</div></div>
                <ArrowUpRight size={14} style={{ color: "var(--text-tertiary)" }} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="nexa-panel flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>You</div>
            <div className="mt-2 flex flex-wrap gap-4 text-[13px]" style={{ color: "var(--text-secondary)" }}>
              <span><b style={{ color: "var(--text-primary)" }}>Career stage</b> · {profile.careerStage || "—"}</span>
              <span><b style={{ color: "var(--text-primary)" }}>Interests</b> · {profile.interests.join(", ") || "—"}</span>
              <span><b style={{ color: "var(--text-primary)" }}>Goals</b> · {profile.goals.join(", ") || "—"}</span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate("/profile")}>Edit profile</Button>
        </div>
      </Reveal>
    </div>
  );
}




