import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useProfile } from "./ProfileContext.jsx";
import { fetchRoadmap, saveRoadmap } from "../lib/dataService.js";
import {
  generateRoadmapPlan, regenerateRoadmapPlan, toggleStepStatus,
  computeProgress, getNextStep, isStale,
} from "../lib/roadmapEngine.js";

const STORAGE_KEY = "nexa_roadmap_v1";
const RoadmapContext = createContext(null);

function loadStoredRoadmap() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function RoadmapProvider({ children }) {
  const { user, configured } = useAuth();
  const { profile, profileLoaded } = useProfile();
  const [roadmap, setRoadmap] = useState(configured ? null : loadStoredRoadmap);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const loadedForUser = useRef(null);

  // ---- Supabase-backed: load this user's roadmap row (or none yet) ----
  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    if (!user) { setRoadmap(null); setLoading(false); loadedForUser.current = null; return; }
    if (loadedForUser.current === user.id) return;
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const r = await fetchRoadmap(user.id);
        if (!alive) return;
        setRoadmap(r);
        loadedForUser.current = user.id;
      } catch {
        if (!alive) return;
        setError("We couldn't load your roadmap right now.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user, configured]);

  // ---- Offline/demo mode: persist to localStorage ----
  useEffect(() => {
    if (configured) return;
    try {
      if (roadmap) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmap));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, [roadmap, configured]);

  const persist = useCallback(async (next) => {
    setRoadmap(next);
    if (!configured || !user) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await saveRoadmap(user.id, next);
      setRoadmap(saved);
    } catch {
      setError("We couldn't update your roadmap right now.");
    } finally {
      setSaving(false);
    }
  }, [configured, user]);

  const generate = useCallback(async () => {
    const plan = generateRoadmapPlan(profile);
    await persist(plan);
  }, [profile, persist]);

  const regenerate = useCallback(async () => {
    const plan = regenerateRoadmapPlan(profile, roadmap?.phases || []);
    await persist(plan);
  }, [profile, roadmap, persist]);

  const toggleStep = useCallback(async (phaseId, stepId) => {
    if (!roadmap) return;
    const phases = toggleStepStatus(roadmap.phases, phaseId, stepId);
    await persist({ ...roadmap, phases });
  }, [roadmap, persist]);

  const stale = useMemo(
    () => (roadmap ? isStale(profile, roadmap.sourceSnapshot) : false),
    [profile, roadmap]
  );
  const progress = useMemo(() => computeProgress(roadmap?.phases || []), [roadmap]);
  const nextStep = useMemo(() => getNextStep(roadmap?.phases || []), [roadmap]);

  const value = useMemo(() => ({
    roadmap, loading: loading || !profileLoaded, saving, error, stale, progress, nextStep,
    generate, regenerate, toggleStep,
  }), [roadmap, loading, profileLoaded, saving, error, stale, progress, nextStep, generate, regenerate, toggleStep]);

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>;
}

export function useRoadmap() {
  const ctx = useContext(RoadmapContext);
  if (!ctx) throw new Error("useRoadmap must be used inside <RoadmapProvider>");
  return ctx;
}
