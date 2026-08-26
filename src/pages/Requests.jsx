import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useConnections } from "../context/ConnectionsContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { fetchProfileNamesByIds } from "../lib/dataService.js";
import RatingForm from "../components/network/RatingForm.jsx";

// Real mentorship request inbox/outbox, backed by connection_requests
// (migrations/003_mentor_network.sql) via ConnectionsContext — the same
// table the "Request a connection" flow on a mentor's profile writes to.
// "Sent" = requests this user made to a mentor. "Received" = requests made
// to the mentor profile this user owns (empty unless they registered as a
// mentor via /become-mentor).
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
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <div className="h-8 w-8 rounded-full animate-spin" style={{ border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Mentorship Requests</h1>
        <p className="text-sm text-stone-500 mt-1">Track requests you've sent and, if you're a mentor, requests you've received.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Sent by you</h2>
        {sent.length === 0 ? (
          <div className="text-center py-10 text-stone-500 border rounded-2xl border-dashed">No requests sent yet. Find a mentor on the Network page to get started.</div>
        ) : (
          <div className="space-y-3">
            {sent.map((req) => {
              const mentor = mentorsById[req.mentor_id];
              return (
                <div key={req.id} className="p-5 bg-white dark:bg-stone-900 border rounded-2xl space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100">{mentor?.name || "Mentor"}</h3>
                      {req.topic && <p className="text-xs text-stone-500">{req.topic}</p>}
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-stone-100 dark:bg-stone-800 rounded-full font-medium capitalize shrink-0">{req.status}</span>
                  </div>
                  {req.message && <p className="text-xs text-stone-600 dark:text-stone-400">{req.message}</p>}
                  <div className="pt-2 flex gap-2 justify-end">
                    {req.status === "pending" && (
                      <button
                        onClick={() => handleCancel(req.id)}
                        disabled={busyId === req.id}
                        className="px-3 py-1.5 bg-stone-200 dark:bg-stone-800 text-xs font-semibold rounded-lg disabled:opacity-50"
                      >
                        {busyId === req.id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                    {req.status === "accepted" && (
                      <button
                        onClick={() => setRatingFor(req)}
                        className="px-3 py-1.5 bg-pink-100 text-pink-700 text-xs font-semibold rounded-lg"
                      >
                        Rate this mentor
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Received (as a mentor)</h2>
        {received.length === 0 ? (
          <div className="text-center py-10 text-stone-500 border rounded-2xl border-dashed">
            No requests received. If you haven't registered as a mentor yet, you can do so from Become a Mentor.
          </div>
        ) : (
          <div className="space-y-3">
            {received.map((req) => (
              <div key={req.id} className="p-5 bg-white dark:bg-stone-900 border rounded-2xl space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">{requesterNames[req.user_id] || "NEXA member"}</h3>
                    {req.topic && <p className="text-xs text-stone-500">{req.topic}</p>}
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-stone-100 dark:bg-stone-800 rounded-full font-medium capitalize shrink-0">{req.status}</span>
                </div>
                {req.message && <p className="text-xs text-stone-600 dark:text-stone-400">{req.message}</p>}
                {req.status === "pending" && (
                  <div className="pt-2 flex gap-2 justify-end">
                    <button
                      onClick={() => handleRespond(req.id, true)}
                      disabled={busyId === req.id}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, false)}
                      disabled={busyId === req.id}
                      className="px-3 py-1.5 bg-stone-200 dark:bg-stone-800 text-xs font-semibold rounded-lg disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {ratingFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setRatingFor(null)}>
          <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
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
