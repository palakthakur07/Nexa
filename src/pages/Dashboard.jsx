import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, ArrowUpRight, Check, Sparkles } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import MatchRing from "../components/ui/MatchRing.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import EmptyState from "../components/dashboard/EmptyState.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useNexaDrawer } from "../context/NexaDrawerContext.jsx";
import { OPPORTUNITIES } from "../data/opportunities.js";
import { WOMEN } from "../data/women.js";
import { COMMUNITIES } from "../data/communities.js";
import { calculateMatchScore, getNextMove, generateRoadmap } from "../lib/scoring.js";

export default function Dashboard() {
  const { profile } = useProfile();
  const { openDrawer } = useNexaDrawer();
  const navigate = useNavigate();

  const opportunities = useMemo(
    () => OPPORTUNITIES.map((o) => ({ ...o, match: calculateMatchScore(profile, o) })).sort((a, b) => b.match - a.match).slice(0, 4),
    [profile]
  );
  const nextMove = useMemo(() => getNextMove(profile), [profile]);
  const roadmap = useMemo(() => generateRoadmap(profile), [profile]);
  const progressPct = Math.round((roadmap.filter((r) => r.status === "done").length / roadmap.length) * 100);
  const strongMatches = opportunities.filter((o) => o.match >= 80).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 md:px-10">
      <Reveal>
        <h1 className="font-display text-[2.2rem] md:text-[2.6rem]">Good morning, {profile.name || "there"}.</h1>
        <p className="mt-2 text-[14.5px]" style={{ color: "var(--text-secondary)" }}>
          Here's what NEXA found for you. <span style={{ color: "var(--text-tertiary)" }}>Demo data — for now.</span>
        </p>
      </Reveal>

      <DashboardSection eyebrow="Your next move" title={nextMove.title}>
        <div className="nexa-panel flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] p-6 sm:flex-row sm:items-center">
          <p className="max-w-md text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{nextMove.why}</p>
          <Button variant="primary" onClick={() => navigate("/discover")}>Continue</Button>
        </div>
      </DashboardSection>

      <DashboardSection eyebrow="Opportunities" title="Opportunities for you" action={<button onClick={() => navigate("/discover")} className="t-fast text-[13px] font-semibold" style={{ color: "var(--accent-strong)" }}>See all</button>}>
        {opportunities.length === 0 ? (
          <EmptyState icon={Compass} text="No saved opportunities yet. NEXA will keep your shortlist here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {opportunities.map((o) => (
              <div key={o.id} className="nexa-card t-standard rounded-[var(--radius-lg)] p-5 hover:shadow-[var(--shadow-md)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[14.5px] font-semibold leading-snug">{o.title}</div>
                    <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{o.org}{o.fullyFunded ? " · Fully funded" : ""}</div>
                  </div>
                  <MatchRing value={o.match} size={40} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">{o.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>Deadline · {o.deadline}</span>
                  <button onClick={() => navigate("/discover")} className="t-fast text-[12.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>View opportunity →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      <DashboardSection eyebrow="Community" title="Women who've been there">
        <div className="grid gap-4 sm:grid-cols-3">
          {WOMEN.map((w) => (
            <div key={w.id} className="nexa-card rounded-[var(--radius-lg)] p-5">
              <Avatar initials={w.name[0]} size={38} />
              <div className="mt-2.5 text-[14px] font-semibold">{w.name}</div>
              <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{w.role} · {w.area}</div>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{w.why}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>Demo profiles — not real users.</div>
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
            <p className="font-display mt-2 text-[15.5px]">I found {strongMatches || opportunities.length} opportunities that fit what you're looking for.</p>
            <Button variant="secondary" size="sm" icon={Sparkles} onClick={openDrawer}>Ask Nexa</Button>
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
