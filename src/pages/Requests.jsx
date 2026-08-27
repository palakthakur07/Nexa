import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Check, X, Clock, Star, Inbox } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useConnections } from "../context/ConnectionsContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { fetchProfileNamesByIds } from "../lib/dataService.js";
import RatingForm from "../components/network/RatingForm.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import Button from "../components/ui/Button.jsx";
import { Reveal } from "../lib/hooks.jsx";

// Real mentorship request inbox/outbox, backed by connection_requests
// (migrations/003_mentor_network.sql) via ConnectionsContext — the same
// table the "Request a connection" flow on a mentor's profile writes to.
// "Sent" = requests this user made to a mentor. "Received" = requests made
// to the mentor profile this user owns (empty unless they registered as a
// mentor via /become-mentor).

const STATUS_STYLES = {
  pending: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  accepted: { bg: "var(--success-soft)", fg: "var(--success)" },
  declined: { bg: "var(--surface-muted)", fg: "var(--text-tertiary)" },
};

function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.declined;
  return (
    <span
      className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize"
      style={{ background: style.bg, color: style.fg }}
    >
      {status}
    </span>
  );
}

function initialsFor(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

export default function Requests() {
  const { user } = useAuth();
  const { sent, received, loaded, respondToReceived, cancelSentRequest, refreshAll } = useConnections();
  const { mentors } = useCatalog();
  const [requesterNames, setRequesterNames] = useState({});
  const [ratingFor, setRatingFor] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const mentorsById = useMemo(() => {
    const map = {};
    for (const m of mentors) map[m.id] = m;
    return map;
  }, [mentors]);

  useEffect(() => {
    const ids = received.map((r) => r.user_id).filter(Boolean);
    if (ids.length === 0) return;
    fetchProfileNamesByIds(ids).then(setRequesterNames);
  }, [received]);

  const handleRespond = useCallback(async (id, accept) => {
    setBusyId(id);
    try {
      await respondToReceived(id, accept);
    } catch (err) {
      alert(err.message || "Could not update this request.");
    } finally {
      setBusyId(null);
    }
  }, [respondToReceived]);

  const handleCancel = useCallback(async (id) => {
    setBusyId(id);
    try {
      await cancelSentRequest(id);
    } catch (err) {
      alert(err.message || "Could not cancel this request.");
    } finally {
      setBusyId(null);
    }
  }, [cancelSentRequest]);

  if (!loaded) {
    return (
      <div className="mx-auto flex max-w-3xl justify-center px-6 py-16 md:px-10">
        <div className="h-8 w-8 rounded-full animate-spin" style={{ border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <Reveal>
        <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Requests</div>
        <h1 className="font-display mt-2 text-[2.1rem]">Mentorship requests</h1>
        <p className="mt-1 text-[14px]" style={{ color: "var(--text-secondary)" }}>
          Track requests you've sent and, if you're a mentor, requests you've received.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-10 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Sent by you</div>
        {sent.length === 0 ? (
          <div className="nexa-card mt-3 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] p-10 text-center">
            <Inbox size={22} style={{ color: "var(--text-tertiary)" }} />
            <div className="text-[15px] font-semibold">No requests sent yet.</div>
            <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Find a mentor on the Network page to get started.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {sent.map((req) => {
              const mentor = mentorsById[req.mentor_id];
              return (
                <div key={req.id} className="nexa-card rounded-[var(--radius-lg)] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar initials={initialsFor(mentor?.name)} size={36} photoUrl={mentor?.photoUrl} />
                      <div>
                        <div className="text-[14.5px] font-semibold">{mentor?.name || "Mentor"}</div>
                        {req.topic && <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{req.topic}</div>}
                      </div>
                    </div>
                    <StatusPill status={req.status} />
                  </div>
                  {req.message && (
                    <p className="mt-3 text-[13px]" style={{ color: "var(--text-secondary)" }}>{req.message}</p>
                  )}
                  {(req.status === "pending" || req.status === "accepted") && (
                    <div className="mt-3 flex justify-end gap-2">
                      {req.status === "pending" && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          disabled={busyId === req.id}
                          className="t-fast rounded-full px-3.5 py-1.5 text-[12px] font-semibold disabled:opacity-50"
                          style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                        >
                          {busyId === req.id ? "Cancelling…" : "Cancel"}
                        </button>
                      )}
                      {req.status === "accepted" && (
                        <button
                          onClick={() => setRatingFor(req)}
                          className="t-fast inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
                          style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}
                        >
                          <Star size={12} /> Rate this mentor
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Reveal>

      <Reveal delay={140}>
        <div className="mt-10 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Received (as a mentor)</div>
        {received.length === 0 ? (
          <div className="nexa-card mt-3 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] p-10 text-center">
            <Clock size={22} style={{ color: "var(--text-tertiary)" }} />
            <div className="text-[15px] font-semibold">No requests received.</div>
            <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>If you haven't registered as a mentor yet, you can do so from Become a Mentor.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {received.map((req) => (
              <div key={req.id} className="nexa-card rounded-[var(--radius-lg)] p-5">
                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                    <Avatar initials={initialsFor(requesterNames[req.user_id]?.name)} size={36} photoUrl={requesterNames[req.user_id]?.photoUrl} />
                    <div>
                      <div className="text-[14.5px] font-semibold">{requesterNames[req.user_id]?.name || "NEXA member"}</div>
                      {req.topic && <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{req.topic}</div>}
                    </div>
                  </div>
                  <StatusPill status={req.status} />
                </div>
                {req.message && (
                  <p className="mt-3 text-[13px]" style={{ color: "var(--text-secondary)" }}>{req.message}</p>
                )}
                {req.status === "pending" && (
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => handleRespond(req.id, true)}
                      disabled={busyId === req.id}
                      className="t-fast inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
                      style={{ background: "var(--success)" }}
                    >
                      <Check size={12} /> Accept
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, false)}
                      disabled={busyId === req.id}
                      className="t-fast inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold disabled:opacity-50"
                      style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                    >
                      <X size={12} /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Reveal>

      {ratingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRatingFor(null)}>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <RatingForm
              connectionRequestId={ratingFor.id}
              mentorId={ratingFor.mentor_id}
              userId={user?.id}
              onSubmitted={() => { setRatingFor(null); refreshAll(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}