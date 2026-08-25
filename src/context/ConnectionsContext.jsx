import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import {
  fetchSentRequests, fetchReceivedRequests, createRequest, cancelRequest, respondToRequest,
  fetchMyMentorProfile,
} from "../lib/dataService.js";

const STORAGE_KEY = "nexa_connections_v1";

// Real request/accept/decline flow (migrations/003_mentor_network.sql).
// "sent" = requests you've made as a member seeking guidance. "received" =
// requests directed at YOUR mentor profile, if you have one — genuinely
// empty if you haven't registered as a mentor, never fabricated. Offline
// (no Supabase), there are no real mentors to request anything from, so
// this is a no-op shell rather than a fake simulation.
function emptyState() {
  return { sent: [], received: [], myMentorProfile: null };
}

function loadStoredSent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).sent || [] : [];
  } catch { return []; }
}

const ConnectionsContext = createContext(null);

export function ConnectionsProvider({ children }) {
  const { user, configured } = useAuth();
  const [state, setState] = useState(emptyState);
  const [loaded, setLoaded] = useState(false);

  const refreshAll = useCallback(async () => {
    if (!configured || !user) { setState(emptyState()); setLoaded(true); return; }
    const myMentorProfile = await fetchMyMentorProfile(user.id);
    const [sentRows, receivedRows] = await Promise.all([
      fetchSentRequests(user.id),
      myMentorProfile ? fetchReceivedRequests(myMentorProfile.id) : Promise.resolve([]),
    ]);
    setState({ myMentorProfile, sent: sentRows, received: receivedRows });
    setLoaded(true);
  }, [user, configured]);

  useEffect(() => {
    if (configured) { refreshAll(); return; }
    setState({ ...emptyState(), sent: loadStoredSent() });
    setLoaded(true);
  }, [configured, refreshAll]);

  useEffect(() => {
    if (configured) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ sent: state.sent })); } catch { /* ignore */ }
  }, [state.sent, configured]);

  const sendRequest = useCallback(async (mentorId, { topic, requestType, message }) => {
    if (isSupabaseConfigured() && user) {
      const row = await createRequest(user.id, mentorId, { topic, requestType, message });
      setState((prev) => ({ ...prev, sent: [row, ...prev.sent] }));
      return row;
    }
    // Offline: no real mentor exists to receive this, so it's purely a
    // local echo — never presented as delivered anywhere.
    const local = { id: `local-${Date.now()}`, user_id: "local", mentor_id: mentorId, topic, request_type: requestType, message, status: "pending", created_at: new Date().toISOString() };
    setState((prev) => ({ ...prev, sent: [local, ...prev.sent] }));
    return local;
  }, [user]);

  const cancelSentRequest = useCallback(async (id) => {
    if (isSupabaseConfigured()) await cancelRequest(id);
    setState((prev) => ({ ...prev, sent: prev.sent.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)) }));
  }, []);

  const respondToReceived = useCallback(async (id, accept) => {
    if (isSupabaseConfigured()) await respondToRequest(id, accept);
    setState((prev) => ({ ...prev, received: prev.received.map((r) => (r.id === id ? { ...r, status: accept ? "accepted" : "declined" } : r)) }));
  }, []);

  const connectionStatusForMentor = useCallback((mentorId) => {
    const mine = state.sent.filter((r) => r.mentor_id === mentorId);
    if (mine.some((r) => r.status === "accepted")) return "accepted";
    if (mine.some((r) => r.status === "pending")) return "pending";
    return "none";
  }, [state.sent]);

  const value = useMemo(() => ({
    ...state, loaded, refreshAll, sendRequest, cancelSentRequest, respondToReceived, connectionStatusForMentor,
  }), [state, loaded, refreshAll, sendRequest, cancelSentRequest, respondToReceived, connectionStatusForMentor]);

  return <ConnectionsContext.Provider value={value}>{children}</ConnectionsContext.Provider>;
}

export function useConnections() {
  const ctx = useContext(ConnectionsContext);
  if (!ctx) throw new Error("useConnections must be used inside <ConnectionsProvider>");
  return ctx;
}
