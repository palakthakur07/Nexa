import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const STORAGE_KEY = "nexa_profile_v1";

export function emptyProfile() {
  return {
    name: "",
    location: { country: "", city: "", openToRelocation: "" },
    careerStage: "",
    interests: [],
    goals: [],
    skills: [],
    priorities: [],
    onboardingComplete: false,
  };
}

export const DEMO_PROFILE = {
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
    // Guard against corrupt/partial data from an older shape.
    return { ...emptyProfile(), ...parsed, location: { ...emptyProfile().location, ...(parsed.location || {}) } };
  } catch {
    return emptyProfile();
  }
}

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(loadStoredProfile);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // localStorage unavailable (private browsing, storage full, etc.) —
      // the app still works for the current session, it just won't persist.
    }
  }, [profile]);

  const loadDemo = useCallback(() => setProfile(DEMO_PROFILE), []);
  const resetProfile = useCallback(() => setProfile(emptyProfile()), []);

  const value = useMemo(() => ({ profile, setProfile, loadDemo, resetProfile }), [profile, loadDemo, resetProfile]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}
