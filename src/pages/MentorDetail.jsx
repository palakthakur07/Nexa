import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircleQuestion, Sparkles, Star } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import MatchRing from "../components/ui/MatchRing.jsx";
import MatchExplanation from "../components/network/MatchExplanation.jsx";
import VerifiedBadge from "../components/network/VerifiedBadge.jsx";
import ConnectionStatus from "../components/network/ConnectionStatus.jsx";
import RequestModal from "../components/network/RequestModal.jsx";
import ConnectionThread from "../components/network/ConnectionThread.jsx";
import RatingForm from "../components/network/RatingForm.jsx";
import ReportBlockMenu from "../components/network/ReportBlockMenu.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useConnections } from "../context/ConnectionsContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { calculateMentorMatchScore, getMentorMatchReasons } from "../lib/mentorMatching.js";
import { fetchMentorRatings } from "../lib/dataService.js";

export default function MentorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { sent, sendRequest, connectionStatusForMentor } = useConnections();
  const { mentors, loading } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [ratedRequestIds, setRatedRequestIds] = useState(new Set());

  const mentor = mentors.find((m) => m.id === id);

  useEffect(() => {
    if (!mentor) return;
    fetchMentorRatings(mentor.id).then((rows) => {
      setRatings(rows);
      setRatedRequestIds(new Set(rows.map((r) => r.connection_request_id)));
    });
  }, [mentor]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-6">
        <div className="anim-spin-slow h-8 w-8 rounded-full" style={{ border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-[1.8rem]">Profile not found</h1>
        <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>This mentor may have turned off discoverability, or the profile no longer exists.</p>
        <button onClick={() => navigate("/network")} className="t-fast mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--accent-strong)" }}><ArrowLeft size={15} /> Back to Network</button>
      </div>
    );
  }

  const isOwnProfile = mentor.userId === user?.id;
  const match = calculateMentorMatchScore(profile, mentor);
  const reasons = getMentorMatchReasons(profile, mentor);
  const status = connectionStatusForMentor(mentor.id);
  const initials = mentor.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  const acceptedRequest = sent.find((r) => r.mentor_id === mentor.id && r.status === "accepted");
  const ratingAvg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/network")} className="t-fast inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}><ArrowLeft size={14} /> Back to Network</button>
        {!isOwnProfile && <ReportBlockMenu reportedUserId={mentor.userId} connectionRequestId={acceptedRequest?.id} />}
      </div>

      <Reveal delay={40}>
        <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <Avatar initials={initials} photoUrl={mentor.photoUrl} size={64} />
            <div>
              <div className="flex flex-wrap items-center gap-2"><VerifiedBadge verified={mentor.verified} /></div>
              <h1 className="font-display mt-1.5 text-[1.9rem] leading-tight">{mentor.name}</h1>
              <div className="mt-0.5 text-[14px]" style={{ color: "var(--text-secondary)" }}>{mentor.headline}</div>
              <div className="text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>{mentor.location}</div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>
                <Star size={13} style={{ color: ratings.length ? "var(--warning, #d97706)" : "var(--text-tertiary)" }} fill={ratings.length ? "currentColor" : "none"} />
                {ratings.length ? <span><b style={{ color: "var(--text-primary)" }}>{ratingAvg.toFixed(1)}</b> based on {ratings.length} verified interaction{ratings.length === 1 ? "" : "s"}</span> : <span>No reviews yet</span>}
              </div>
              {!isOwnProfile && <div className="mt-3"><ConnectionStatus status={status} /></div>}
            </div>
          </div>
          <MatchRing value={match} size={80} />
        </div>
        {isOwnProfile ? (
          <div className="mt-5"><Button variant="secondary" onClick={() => navigate("/become-mentor")}>Edit my profile</Button></div>
        ) : (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="primary" icon={MessageCircleQuestion} onClick={() => setModalOpen(true)} disabled={status !== "none"}>
              {status === "none" ? "Request guidance" : status === "pending" ? "Request pending" : "Already connected"}
            </Button>
            <Button variant="ghost" icon={Sparkles} onClick={() => navigate("/nexa", { state: { entryContext: { type: "network" } } })}>Ask NEXA who I should talk to</Button>
          </div>
        )}
      </Reveal>

      <Reveal delay={90} className="mt-10"><h2 className="font-display text-[1.4rem]">About</h2><p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{mentor.about || "No bio provided yet."}</p></Reveal>

      <Reveal delay={130} className="mt-10">
        <h2 className="font-display text-[1.4rem]">Why NEXA thinks they may be useful to you</h2>
        <div className="nexa-panel mt-4 rounded-[var(--radius-lg)] p-6">
          <div className="font-display text-[1.7rem]">{match}% match</div>
          <div className="mt-4"><MatchExplanation reasons={reasons} title="Why NEXA recommends them" /></div>
        </div>
      </Reveal>

      {mentor.experience?.length > 0 && (
        <Reveal delay={170} className="mt-10">
          <h2 className="font-display text-[1.4rem]">Experience</h2>
          <div className="mt-3 flex flex-wrap gap-2">{mentor.experience.map((e) => <Badge key={e}>{e}</Badge>)}</div>
        </Reveal>
      )}

      {mentor.canHelpWith?.length > 0 && (
        <Reveal delay={210} className="mt-10">
          <h2 className="font-display text-[1.4rem]">Can help with</h2>
          <ul className="mt-3 space-y-1.5">{mentor.canHelpWith.map((c) => <li key={c} className="text-[13.5px]" style={{ color: "var(--text-primary)" }}>· {c}</li>)}</ul>
        </Reveal>
      )}

      {mentor.skills?.length > 0 && (
        <Reveal delay={250} className="mt-10">
          <h2 className="font-display text-[1.4rem]">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">{mentor.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>
        </Reveal>
      )}

      <Reveal delay={290} className="mt-10 grid gap-6 sm:grid-cols-2">
        <div><h2 className="font-display text-[1.2rem]">Languages</h2><p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{(mentor.languages || []).join(", ") || "Not specified"}</p></div>
        <div><h2 className="font-display text-[1.2rem]">Availability</h2><p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{mentor.availability || "Not specified"}</p></div>
      </Reveal>

      {ratings.length > 0 && (
        <Reveal delay={310} className="mt-10">
          <h2 className="font-display text-[1.4rem]">Reviews</h2>
          <div className="mt-4 space-y-3">
            {ratings.filter((r) => r.feedback).map((r) => (
              <div key={r.id} className="nexa-card rounded-[var(--radius-md)] p-4">
                <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} style={{ color: i < r.rating ? "var(--warning, #d97706)" : "var(--border-strong)" }} fill={i < r.rating ? "currentColor" : "none"} />)}</div>
                <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>{r.feedback}</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {status === "accepted" && acceptedRequest && (
        <Reveal delay={370} className="my-10">
          <h2 className="font-display text-[1.4rem]">Your conversation</h2>
          <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>You're connected — messages here are private between the two of you.</p>
          <div className="mt-4"><ConnectionThread requestId={acceptedRequest.id} /></div>
          {!ratedRequestIds.has(acceptedRequest.id) && (
            <div className="mt-5">
              <RatingForm
                connectionRequestId={acceptedRequest.id} mentorId={mentor.id} userId={user.id}
                onSubmitted={(row) => { setRatings((prev) => [row, ...prev]); setRatedRequestIds((prev) => new Set([...prev, acceptedRequest.id])); }}
              />
            </div>
          )}
        </Reveal>
      )}

      <RequestModal mentor={mentor} open={modalOpen} onClose={() => setModalOpen(false)} onSend={(fields) => sendRequest(mentor.id, fields)} />
    </div>
  );
}
