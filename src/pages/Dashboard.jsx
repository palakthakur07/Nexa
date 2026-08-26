import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, ArrowUpRight, UserPlus } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import MentorCard from "../components/network/MentorCard.jsx";
import OpportunityCard from "../components/discover/OpportunityCard.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { calculateMatchScore } from "../lib/matching.js";
import { calculateMentorMatchScore } from "../lib/mentorMatching.js";
import { fetchRatingsSummary } from "../lib/dataService.js";
import { getNextMove, generateRoadmap } from "../lib/scoring.js";

export default function Dashboard() {
  const { profile } = useProfile();
  const { opportunities, mentors, communities } = useCatalog();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    fetchRatingsSummary().then(setRatings);
  }, []);

  const topOpportunities = useMemo(
    () =>
      opportunities
        .map((o) => ({ opportunity: o, match: calculateMatchScore(profile, o) }))
        .sort((a, b) => b.match - a.match)
        .slice(0, 3),
    [profile, opportunities]
  );

  // Filters out blank/un-onboarded mentor profiles to avoid broken empty cards
  const topMentors = useMemo(
    () =>
      mentors
        .filter((m) => m && m.name)
        .map((m) => ({
          mentor: m,
          match: calculateMentorMatchScore(profile, m),
        }))
        .sort((a, b) => b.match - a.match)
        .slice(0, 3),
    [profile, mentors]
  );

  const nextMove = useMemo(() => getNextMove(profile), [profile]);
  const roadmap = useMemo(() => generateRoadmap(profile), [profile]);
  const progressPct = Math.round(
    (roadmap.filter((r) => r.status === "done").length / roadmap.length) * 100
  );
  const strongMatches = topOpportunities.filter((o) => o.match >= 80).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 md:px-10">
      <Reveal>
        <h1 className="font-display text-[2.2rem] md:text-[2.6rem]">
          Good morning, {profile.name || "there"}.
        </h1>
        <p
          className="mt-2 text-[14.5px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Here's what NEXA found for you.
        </p>
      </Reveal>

      <DashboardSection eyebrow="Your next move" title={nextMove.title}>
        <div className="nexa-panel flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] p-6 sm:flex-row sm:items-center">
          <p
            className="max-w-md text-[14px] leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {nextMove.why}
          </p>
          <Button variant="primary" onClick={() => navigate("/discover")}>
            Continue
          </Button>
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="Opportunities"
        title="Opportunities for you"
        action={
          <button
            onClick={() => navigate("/discover")}
            className="t-fast text-[13px] font-semibold"
            style={{ color: "var(--accent-strong)" }}
          >
            See all opportunities
          </button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topOpportunities.map(({ opportunity, match }) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              match={match}
              compact
            />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="Community"
        title="Mentors who've been there"
        action={
          <button
            onClick={() => navigate("/network")}
            className="t-fast text-[13px] font-semibold"
            style={{ color: "var(--accent-strong)" }}
          >
            Meet the network
          </button>
        }
      >
        {topMentors.length === 0 ? (
          <div className="nexa-card flex flex-col items-center gap-2 rounded-[var(--radius-lg)] p-8 text-center">
            <p
              className="text-[13px]"
              style={{ color: "var(--text-secondary)" }}
            >
              No one has registered as a mentor yet — be the first.
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={UserPlus}
              onClick={() => navigate("/become-mentor")}
            >
              Become a mentor
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {topMentors.map(({ mentor, match }) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                match={match}
                ratingAvg={ratings[mentor.id]?.avg || mentor.rating_avg || 0}
                ratingCount={ratings[mentor.id]?.count || mentor.rating_count || 0}
              />
            ))}
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        eyebrow="Progress"
        title="Your roadmap"
        action={<span className="font-display text-[1.4rem]">{progressPct}%</span>}
      >
        <div className="nexa-card rounded-[var(--radius-lg)] p-6">
          {roadmap.map((r, i) => (
            <div
              key={r.label}
              className="flex items-center gap-3 py-2.5"
              style={{
                borderBottom:
                  i < roadmap.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{
                  background:
                    r.status === "done"
                      ? "var(--success-soft)"
                      : r.status === "now"
                      ? "var(--accent-soft)"
                      : "var(--surface-muted)",
                  color:
                    r.status === "done"
                      ? "var(--success)"
                      : r.status === "now"
                      ? "var(--accent-strong)"
                      : "var(--text-tertiary)",
                }}
              >
                {r.status === "done" ? (
                  <Check size={12} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </div>
              <span
                className="text-[13.5px] font-medium"
                style={{
                  color:
                    r.status === "later"
                      ? "var(--text-tertiary)"
                      : "var(--text-primary)",
                }}
              >
                {r.label}
              </span>
              {r.status === "now" && <Badge tone="accent">Now</Badge>}
            </div>
          ))}
        </div>
      </DashboardSection>

      <div className="mb-14 grid gap-6 md:grid-cols-2">
        <Reveal>
          <div
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--accent-strong)" }}
          >
            Nexa
          </div>
          <div className="nexa-panel mt-3 rounded-[var(--radius-lg)] p-5">
            <div className="flex items-center gap-2">
              <span
                className="anim-glow inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--accent-strong)" }}
              />
              <span
                className="text-[11px] font-semibold"
                style={{ color: "var(--text-tertiary)" }}
              >
                Active
              </span>
            </div>
            <p className="font-display mt-2 text-[15.5px]">
              I found {strongMatches || topOpportunities.length} opportunities
              that fit what you're looking for.
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate("/nexa")}
            >
              Ask Nexa
            </Button>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--accent-strong)" }}
          >
            Communities
          </div>
          <div className="nexa-card mt-3 space-y-2.5 rounded-[var(--radius-lg)] p-5">
            {communities.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold">{c.name}</div>
                  <div
                    className="text-[11.5px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {c.category}
                  </div>
                </div>
                <ArrowUpRight
                  size={14}
                  style={{ color: "var(--text-tertiary)" }}
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="nexa-panel flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] p-6 sm:flex-row sm:items-center">
          <div>
            <div
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--accent-strong)" }}
            >
              You
            </div>
            <div
              className="mt-2 flex flex-wrap gap-4 text-[13px]"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>
                <b style={{ color: "var(--text-primary)" }}>Career stage</b> ·{" "}
                {profile.careerStage || "—"}
              </span>
              <span>
                <b style={{ color: "var(--text-primary)" }}>Interests</b> ·{" "}
                {profile.interests.join(", ") || "—"}
              </span>
              <span>
                <b style={{ color: "var(--text-primary)" }}>Goals</b> ·{" "}
                {profile.goals.join(", ") || "—"}
              </span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate("/profile")}>
            Edit profile
          </Button>
        </div>
      </Reveal>
    </div>
  );
}