import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const STORAGE_KEY = "nexa_saved_v1";

export const APPLICATION_STATUSES = [
  "Interested", "Planning to apply", "Application started", "Applied", "Interview", "Accepted", "Not selected",
];

// Shape: { [opportunityId]: { status: string, savedAt: ISOString } }
function loadStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const [saved, setSaved] = useState(loadStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // storage unavailable — session-only fallback, no crash
    }
  }, [saved]);

  const isSaved = useCallback((id) => Boolean(saved[id]), [saved]);

  const toggleSave = useCallback((id) => {
    setSaved((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { status: "Interested", savedAt: new Date().toISOString() } };
    });
  }, []);

  const removeSaved = useCallback((id) => {
    setSaved((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const setStatus = useCallback((id, status) => {
    setSaved((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], status } } : prev));
  }, []);

  const value = useMemo(() => ({ saved, isSaved, toggleSave, removeSaved, setStatus }), [saved, isSaved, toggleSave, removeSaved, setStatus]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside <SavedProvider>");
  return ctx;
}
