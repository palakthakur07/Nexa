import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import { fetchRequests, createRequest } from "../lib/dataService.js";

const STORAGE_KEY = "nexa_connections_v1";

// With a real backend, "sent" requests are rows in connection_requests.
// Incoming ("received") requests require a mentor-facing app that doesn't
// exist yet, so that list is genuinely empty until that's built — no more
// fabricated inbound requests. Connections are the requests a mentor has
// accepted. Offline (no Supabase) it all lives in localStorage, starting
// empty (no fake seed data).
function emptyState() {
  return { sent: [], received: [], connections: [] };
}

function loadStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : emptyState();
  } catch { return emptyState(); }
}

const ConnectionsContext = createContext(null);

export function ConnectionsProvider({ children }) {
  const { user, configured } = useAuth();
  const [state, setState] = useState(configured ? emptyState : loadStored);

  useEffect(() => {
    if (!configured) return;
    if (!user) { setState(emptyState()); return; }
    let alive = true;
    fetchRequests(user.id).then((rows) => {
      if (!alive) return;
      const sent = rows.map((r) => ({ id: r.id, womanId: r.mentor_id, topic: r.topic, requestType: r.request_type, message: r.message, status: r.status, createdAt: r.created_at }));
      const connections = rows.filter((r) => r.status === "accepted").map((r) => ({ id: r.id, womanId: r.mentor_id, name: r.topic, reason: r.topic, since: r.created_at }));
      setState({ sent, received: [], connections });
    });
    return () => { alive = false; };
  }, [user, configured]);

  useEffect(() => {
    if (configured) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, configured]);

  const sendRequest = useCallback(async (womanId, { topic, requestType, message }) => {
    if (isSupabaseConfigured() && user) {
      const row = await createRequest(user.id, womanId, { topic, requestType, message });
      if (row) {
        setState((prev) => ({ ...prev, sent: [{ id: row.id, womanId, topic, requestType, message, status: "pending", createdAt: row.created_at }, ...prev.sent] }));
        return;
      }
    }
    setState((prev) => ({ ...prev, sent: [...prev.sent, { id: `sent-${Date.now()}`, womanId, topic, requestType, message, status: "pending", createdAt: new Date().toISOString() }] }));
  }, [user]);

  const acceptReceived = useCallback((id) => {
    setState((prev) => {
      const req = prev.received.find((r) => r.id === id);
      if (!req) return prev;
      return {
        ...prev,
        received: prev.received.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)),
        connections: [...prev.connections, { id: `conn-${Date.now()}`, womanId: null, name: req.personName, reason: req.topic, since: new Date().toISOString() }],
      };
    });
  }, []);

  const declineReceived = useCallback((id) => {
    setState((prev) => ({ ...prev, received: prev.received.map((r) => (r.id === id ? { ...r, status: "declined" } : r)) }));
  }, []);

  const connectionStatusForWoman = useCallback((womanId) => {
    if (state.connections.some((c) => c.womanId === womanId)) return "connected";
    if (state.sent.some((r) => r.womanId === womanId && r.status === "pending")) return "pending";
    return "none";
  }, [state]);

  const value = useMemo(() => ({
    ...state, sendRequest, acceptReceived, declineReceived, connectionStatusForWoman,
  }), [state, sendRequest, acceptReceived, declineReceived, connectionStatusForWoman]);

  return <ConnectionsContext.Provider value={value}>{children}</ConnectionsContext.Provider>;
}

export function useConnections() {
  const ctx = useContext(ConnectionsContext);
  if (!ctx) throw new Error("useConnections must be used inside <ConnectionsProvider>");
  return ctx;
}

