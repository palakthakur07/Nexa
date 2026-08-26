import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext.jsx";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import { rowToProfile, profileToRow } from "../lib/mappers.js";

const STORAGE_KEY = "nexa_profile_v1";

export function emptyProfile() {
  return {
    name: "",
    email: "",
    location: { country: "", city: "", openToRelocation: "" },
    careerStage: "",
    interests: [],
    goals: [],
    skills: [],
    priorities: [],
    onboardingComplete: false,
    roles: ["member"],
    helpTopics: [],
    giveBack: null,
    customRoadmapItems: [],
  };
}

// Retained so the offline (no-Supabase) demo can still preload a filled
// profile. With Supabase configured, real profiles come from the database.
export const DEMO_PROFILE = {
  ...emptyProfile(),
  name: "Palak",
  location: { country: "India", city: "Bengaluru", openToRelocation: "Yes" },
  careerStage: "Student",
  interests: ["AI & Technology", "Research"],
  goals: ["Get a scholarship", "Study abroad"],
  skills: ["Python", "AI/ML", "Research"],
  priorities: ["Funding", "Mentorship"],
  onboardingComplete: true,
};

function loadStoredProfile() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw);
    return { ...emptyProfile(), ...parsed, location: { ...emptyProfile().location, ...(parsed.location || {}) } };
  } catch {
    return emptyProfile();
  }
}

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user, configured } = useAuth();
  const [profile, setProfile] = useState(configured ? emptyProfile : loadStoredProfile);
  const [loaded, setLoaded] = useState(!configured);
  const saveTimer = useRef(null);
  const skipNextSave = useRef(true); // don't write back the row we just read

  // ---- Supabase-backed: load this user's profile row ----
  useEffect(() => {
    if (!configured) return;
    if (!user) { setProfile(emptyProfile()); setLoaded(true); return; }
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!alive) return;
      if (error) {
        console.error("load profile:", error.message);
        setProfile({ ...emptyProfile(), email: user.email || "" });
      } else {
        skipNextSave.current = true;
        setProfile(rowToProfile(data));
      }
      setLoaded(true);
    })();
    return () => { alive = false; };
  }, [user, configured]);

  // ---- Persist: Supabase (debounced) when signed in, else localStorage ----
  useEffect(() => {
    if (!configured) {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch { /* ignore */ }
      return;
    }
    if (!user || !loaded) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase.from("profiles").update(profileToRow(profile)).eq("id", user.id);
      if (error) console.error("save profile:", error.message);
    }, 500);
    return () => saveTimer.current && clearTimeout(saveTimer.current);
  }, [profile, user, configured, loaded]);

  const loadDemo = useCallback(() => setProfile(DEMO_PROFILE), []);
  const resetProfile = useCallback(() => setProfile((p) => ({ ...emptyProfile(), email: p.email })), []);
  const addRoadmapItem = useCallback((label) => {
    setProfile((p) => (p.customRoadmapItems.includes(label) ? p : { ...p, customRoadmapItems: [...p.customRoadmapItems, label] }));
  }, []);

  const value = useMemo(
    () => ({ profile, setProfile, loadDemo, resetProfile, addRoadmapItem, profileLoaded: loaded }),
    [profile, loadDemo, resetProfile, addRoadmapItem, loaded]
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}

