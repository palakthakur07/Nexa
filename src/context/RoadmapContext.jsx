import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useProfile } from "./ProfileContext.jsx";
import { useCatalog } from "./CatalogContext.jsx";
import { fetchRoadmap, saveRoadmap } from "../lib/dataService.js";
import {
  generateRoadmap, attachRuntimeData, mergeCompletion,
  profileSignature, signaturesDiffer,
} from "../lib/roadmapEngine.js";

const STORAGE_KEY = "nexa_roadmap_v1";
const RoadmapContext = createContext(null);

function loadStoredRoadmap() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Whether the profile has enough signal to generate anything meaningful
// (empty state per section 19 otherwise).
function canGenerateFrom(profile) {
  return Boolean(profile.careerStage || profile.goals?.length || profile.interests?.length);
}

export function RoadmapProvider({ children }) {
  const { user, configured } = useAuth();
  const { profile, profileLoaded } = useProfile();
  const { opportunities } = useCatalog();

  // `roadmapRow` is the persisted shape: {goal, title, description, phases
  // (with plain completed booleans), generatedFrom}. Runtime status +
  // opportunity attachment is derived, never stored.
  const [roadmapRow, setRoadmapRow] = useState(null);
  const [loaded, setLoaded] = useState(!configured);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const savingRef = useRef(false);

  const persist = useCallback(async (row) => {
    if (!configured) {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(row)); } catch { /* ignore */ }
      return row;
    }
    if (!user) return row;
    const saved = await saveRoadmap(user.id, row);
    return saved || row;
  }, [configured, user]);

  // ---- initial load (+ first-time auto-generate) ----
  useEffect(() => {
    if (!profileLoaded) return;
    let alive = true;
    (async () => {
      setError(null);
      try {
        let row = configured && user ? await fetchRoadmap(user.id) : (configured ? null : loadStoredRoadmap());
        if (!row && canGenerateFrom(profile)) {
          const fresh = generateRoadmap(profile);
          row = { ...fresh, generatedFrom: profileSignature(profile) };
          row = await persist(row);
        }
        if (!alive) return;
        setRoadmapRow(row);
      } catch (err) {
        console.error("load roadmap:", err.message);
        if (alive) setError("We couldn't load your roadmap right now.");
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
    // Regenerating on every profile keystroke would be noisy — this effect
    // is intentionally load-only; explicit changes go through regenerate().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, configured, profileLoaded]);

  const regenerate = useCallback(async () => {
    if (!profileLoaded || regenerating) return;
    setRegenerating(true);
    setError(null);
    try {
      const fresh = generateRoadmap(profile);
      const merged = mergeCompletion(fresh, roadmapRow?.phases || []);
      const row = { ...merged, generatedFrom: profileSignature(profile) };
      const saved = await persist(row);
      setRoadmapRow(saved);
    } catch (err) {
      console.error("regenerate roadmap:", err.message);
      setError("We couldn't update your roadmap right now.");
    } finally {
      setRegenerating(false);
    }
  }, [profile, profileLoaded, roadmapRow, persist, regenerating]);

  const setStepCompleted = useCallback(async (phaseId, stepId, completed) => {
    if (!roadmapRow) return;
    const nowIso = new Date().toISOString();
    const nextRow = {
      ...roadmapRow,
      phases: roadmapRow.phases.map((p) => (
        p.id !== phaseId ? p : {
          ...p,
          steps: p.steps.map((s) => (s.id !== stepId ? s : { ...s, completed, completedAt: completed ? nowIso : null })),
        }
      )),
    };
    setRoadmapRow(nextRow); // optimistic
    if (savingRef.current) return; // a save is already in flight; the next effect tick will catch up
    savingRef.current = true;
    try {
      const saved = await persist(nextRow);
      if (saved) setRoadmapRow(saved);
    } catch (err) {
      console.error("save roadmap step:", err.message);
      setError("We couldn't save that update — please try again.");
    } finally {
      savingRef.current = false;
    }
  }, [roadmapRow, persist]);

  const runtime = useMemo(
    () => (roadmapRow ? attachRuntimeData(roadmapRow, profile, opportunities) : null),
    [roadmapRow, profile, opportunities]
  );

  const needsUpdate = useMemo(
    () => Boolean(roadmapRow && signaturesDiffer(roadmapRow.generatedFrom, profileSignature(profile))),
    [roadmapRow, profile]
  );

  const value = useMemo(() => ({
    roadmap: runtime,
    loaded,
    error,
    regenerating,
    needsUpdate,
    canGenerate: canGenerateFrom(profile),
    regenerate,
    setStepCompleted,
  }), [runtime, loaded, error, regenerating, needsUpdate, profile, regenerate, setStepCompleted]);

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>;
}

export function useRoadmap() {
  const ctx = useContext(RoadmapContext);
  if (!ctx) throw new Error("useRoadmap must be used inside <RoadmapProvider>");
  return ctx;
}
