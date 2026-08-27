import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowUpRight, UserPlus } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import MentorCard from "../components/network/MentorCard.jsx";
import OpportunityCard from "../components/discover/OpportunityCard.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { calculateMatchScore } from "../lib/matching.js";
import { rankCommunities } from "../lib/communityMatching.js";
import { calculateMentorMatchScore } from "../lib/mentorMatching.js";
import { fetchRatingsSummary } from "../lib/dataService.js";
import { getNextMove } from "../lib/scoring.js";
import { useRoadmap } from "../context/RoadmapContext.jsx";

export default function Dashboard() {
  const { profile } = useProfile();
  const { opportunities, mentors, communities } = useCatalog();
  const { roadmap } = useRoadmap();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    fetchRatingsSummary().then(setRatings);
  }, []);

  const rankedCommunities = useMemo(
    () => rankCommunities(profile, communities, 3),
    [profile, communities]
  );

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
        action={roadmap && <span className="font-display text-[1.4rem]">{roadmap.progress.pct}%</span>}
      >
        {roadmap ? (
          <div className="nexa-card rounded-[var(--radius-lg)] p-6">
            <div className="text-[15.5px] font-semibold">{roadmap.title}</div>
            <div className="mt-1 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>
              Current phase ·{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {roadmap.phases.find((p) => p.status === "in_progress")?.title || "Getting started"}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-muted)" }}>
              <div className="h-full rounded-full" style={{ width: `${roadmap.progress.pct}%`, background: "var(--accent-strong)" }} />
            </div>
            {roadmap.nextAction && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Next</div>
                  <div className="text-[13.5px] font-medium">{roadmap.nextAction.title}</div>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate("/roadmap")}>
                  Continue Roadmap →
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="nexa-card flex flex-col items-center gap-2 rounded-[var(--radius-lg)] p-8 text-center">
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              Tell NEXA what you're working toward and we'll build a personalized roadmap for you.
            </p>
            <Button variant="secondary" size="sm" onClick={() => navigate("/roadmap")}>Build my roadmap</Button>
          </div>
        )}
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
            {rankedCommunities.map((c) => {
              const Row = c.url ? "a" : "div";
              const rowProps = c.url ? { href: c.url, target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Row key={c.id} className="flex items-center justify-between group" style={c.url ? { cursor: "pointer" } : undefined} {...rowProps}>
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
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </Row>
              );
            })}
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