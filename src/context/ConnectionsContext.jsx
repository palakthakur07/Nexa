import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const STORAGE_KEY = "nexa_connections_v1";

// Seeded once on first load so /network/connections isn't empty for a demo
// — these represent other (fictional) users reaching out, since there's no
// real backend to generate them. Never re-seeded after the user interacts.
function seedState() {
  const now = Date.now();
  return {
    sent: [],
    received: [
      { id: "recv-seed-1", personName: "Divya Nair", personRole: "Aspiring UX Researcher", topic: "Interview preparation", requestType: "Quick question", message: "I saw you help with interview prep — I have a UX research interview next week and could use a tip or two.", status: "pending", createdAt: new Date(now - 86400000 * 2).toISOString() },
      { id: "recv-seed-2", personName: "Farah Sheikh", personRole: "Career changer, ex-teacher", topic: "Career advice", requestType: "15-minute chat", message: "I'm moving from teaching into ed-tech and would love 15 minutes of your perspective if you have time.", status: "pending", createdAt: new Date(now - 86400000).toISOString() },
    ],
    connections: [
      { id: "conn-seed-1", womanId: "woman-003", name: "Meera Iyer", reason: "Design career change", since: new Date(now - 86400000 * 5).toISOString() },
    ],
  };
}

function loadStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return seedState();
  } catch {
    return seedState();
  }
}

const ConnectionsContext = createContext(null);

export function ConnectionsProvider({ children }) {
  const [state, setState] = useState(loadStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable — session-only fallback
    }
  }, [state]);

  const sendRequest = useCallback((womanId, { topic, requestType, message }) => {
    setState((prev) => ({
      ...prev,
      sent: [...prev.sent, { id: `sent-${Date.now()}`, womanId, topic, requestType, message, status: "pending", createdAt: new Date().toISOString() }],
    }));
  }, []);

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
