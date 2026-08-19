import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircleQuestion } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import WomanMatchScore from "../components/network/WomanMatchScore.jsx";
import MatchExplanation from "../components/network/MatchExplanation.jsx";
import VerifiedBadge from "../components/network/VerifiedBadge.jsx";
import ConnectionStatus from "../components/network/ConnectionStatus.jsx";
import JourneyTimeline from "../components/network/JourneyTimeline.jsx";
import HelpRequestModal from "../components/network/HelpRequestModal.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useConnections } from "../context/ConnectionsContext.jsx";
import { WOMEN } from "../data/women.js";
import { calculateWomanMatchScore, getWomanMatchReasons } from "../lib/womanMatching.js";

const CONVERSATION_STARTERS = [
  "What was your biggest challenge when you started?",
  "How did you approach your first application?",
  "What would you do differently?",
  "Could you recommend resources?",
];

export default function WomanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { sendRequest, connectionStatusForWoman } = useConnections();
  const [modalOpen, setModalOpen] = useState(false);
  const [starterDraft, setStarterDraft] = useState(null);

  const woman = WOMEN.find((w) => w.id === id);
  if (!woman) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-[1.8rem]">Profile not found</h1>
        <button onClick={() => navigate("/network")} className="t-fast mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--accent-strong)" }}><ArrowLeft size={15} /> Back to Network</button>
      </div>
    );
  }

  const match = calculateWomanMatchScore(profile, woman);
  const reasons = getWomanMatchReasons(profile, woman);
  const status = connectionStatusForWoman(woman.id);
  const initials = woman.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <button onClick={() => navigate("/network")} className="t-fast inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}><ArrowLeft size={14} /> Back to Network</button>

      <Reveal delay={40}>
        <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <Avatar initials={initials} size={64} />
            <div>
              <div className="flex flex-wrap items-center gap-2"><VerifiedBadge /></div>
              <h1 className="font-display mt-1.5 text-[1.9rem] leading-tight">{woman.name}</h1>
              <div className="mt-0.5 text-[14px]" style={{ color: "var(--text-secondary)" }}>{woman.headline}</div>
              <div className="text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>{woman.location}</div>
              <div className="mt-3"><ConnectionStatus status={status} /></div>
            </div>
          </div>
          <WomanMatchScore value={match} size={80} />
        </div>
        <div className="mt-5">
          <Button variant="primary" icon={MessageCircleQuestion} onClick={() => setModalOpen(true)} disabled={status !== "none"}>
            {status === "none" ? "Ask for help" : status === "pending" ? "Request pending" : "Already connected"}
          </Button>
        </div>
      </Reveal>

      <Reveal delay={90} className="mt-10"><h2 className="font-display text-[1.4rem]">About</h2><p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{woman.about}</p></Reveal>

      <Reveal delay={130} className="mt-10">
        <h2 className="font-display text-[1.4rem]">Why NEXA thinks she may be useful to you</h2>
        <div className="nexa-panel mt-4 rounded-[var(--radius-lg)] p-6">
          <div className="font-display text-[1.7rem]">{match}% match</div>
          <div className="mt-4"><MatchExplanation reasons={reasons} /></div>
        </div>
      </Reveal>

      <Reveal delay={170} className="mt-10"><h2 className="font-display text-[1.4rem]">Her journey</h2><div className="mt-5"><JourneyTimeline steps={woman.journey} /></div></Reveal>

      <Reveal delay={210} className="mt-10">
        <h2 className="font-display text-[1.4rem]">Experience</h2>
        <div className="mt-3 flex flex-wrap gap-2">{woman.experience.map((e) => <Badge key={e}>{e}</Badge>)}</div>
      </Reveal>

      <Reveal delay={250} className="mt-10">
        <h2 className="font-display text-[1.4rem]">Can help with</h2>
        <ul className="mt-3 space-y-1.5">{woman.canHelpWith.map((c) => <li key={c} className="text-[13.5px]" style={{ color: "var(--text-primary)" }}>· {c}</li>)}</ul>
      </Reveal>

      <Reveal delay={290} className="mt-10">
        <h2 className="font-display text-[1.4rem]">What she knows</h2>
        <div className="mt-3 flex flex-wrap gap-2">{woman.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>
      </Reveal>

      <Reveal delay={330} className="mt-10 grid gap-6 sm:grid-cols-2">
        <div><h2 className="font-display text-[1.2rem]">Languages</h2><p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{woman.languages.join(", ")}</p></div>
        <div><h2 className="font-display text-[1.2rem]">Availability</h2><p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{woman.availability}</p></div>
      </Reveal>

      {status === "connected" && (
        <Reveal delay={370} className="my-10">
          <h2 className="font-display text-[1.4rem]">Your connection is ready</h2>
          <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>A few ways to start the conversation:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CONVERSATION_STARTERS.map((s) => <button key={s} onClick={() => setStarterDraft(s)} className="chip t-fast rounded-full px-3.5 py-2 text-left text-[12.5px] font-medium">{s}</button>)}
          </div>
          {starterDraft && (
            <div className="nexa-card mt-4 rounded-[var(--radius-md)] p-4">
              <textarea readOnly value={starterDraft} rows={2} className="w-full resize-none border-0 bg-transparent text-[13.5px] outline-none" />
              <div className="mt-2 text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>Demo only — full messaging arrives in a later phase.</div>
            </div>
          )}
        </Reveal>
      )}

      <HelpRequestModal woman={woman} open={modalOpen} onClose={() => setModalOpen(false)} onSend={(fields) => sendRequest(woman.id, fields)} />
    </div>
  );
}
