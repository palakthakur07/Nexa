import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import { fetchSaved, saveOpportunity, unsaveOpportunity, setSavedStatus } from "../lib/dataService.js";

const STORAGE_KEY = "nexa_saved_v1";

export const APPLICATION_STATUSES = [
  "Interested", "Planning to apply", "Application started", "Applied", "Interview", "Accepted", "Not selected",
];

// Shape: { [opportunityId]: { status, savedAt } }
function loadStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const { user, configured } = useAuth();
  const [saved, setSaved] = useState(configured ? {} : loadStored);

  useEffect(() => {
    if (!configured) return;
    if (!user) { setSaved({}); return; }
    let alive = true;
    fetchSaved(user.id).then((map) => { if (alive) setSaved(map); });
    return () => { alive = false; };
  }, [user, configured]);

  useEffect(() => {
    if (configured) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* ignore */ }
  }, [saved, configured]);

  const isSaved = useCallback((id) => Boolean(saved[id]), [saved]);

  const toggleSave = useCallback((id) => {
    setSaved((prev) => {
      if (prev[id]) {
        if (isSupabaseConfigured() && user) unsaveOpportunity(user.id, id);
        const next = { ...prev }; delete next[id]; return next;
      }
      if (isSupabaseConfigured() && user) saveOpportunity(user.id, id, "Interested");
      return { ...prev, [id]: { status: "Interested", savedAt: new Date().toISOString() } };
    });
  }, [user]);

  const removeSaved = useCallback((id) => {
    if (isSupabaseConfigured() && user) unsaveOpportunity(user.id, id);
    setSaved((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }, [user]);

  const setStatus = useCallback((id, status) => {
    if (isSupabaseConfigured() && user) setSavedStatus(user.id, id, status);
    setSaved((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], status } } : prev));
  }, [user]);

  const value = useMemo(() => ({ saved, isSaved, toggleSave, removeSaved, setStatus }), [saved, isSaved, toggleSave, removeSaved, setStatus]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside <SavedProvider>");
  return ctx;
}

