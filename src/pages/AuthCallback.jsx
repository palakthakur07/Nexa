import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useProfile } from "../context/ProfileContext.jsx";

// OAuth / email-verification landing. Supabase parses the URL hash into a
// session (detectSessionInUrl), then we route based on onboarding state —
// waiting for the profile row to load too, not just the session, so a
// brand-new Google sign-up lands on /onboarding instead of skipping
// straight to an empty dashboard.
export default function AuthCallback() {
  const { user, loading } = useAuth();
  const { profile, profileLoaded } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (!profileLoaded) return;
    navigate(profile.onboardingComplete ? "/dashboard" : "/onboarding", { replace: true });
  }, [user, loading, profileLoaded, profile.onboardingComplete, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="anim-spin-slow h-8 w-8 rounded-full" style={{ border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} />
        <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Signing you in…</p>
      </div>
    </div>
  );
}

