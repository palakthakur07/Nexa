import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// OAuth / email-verification landing. Supabase parses the URL hash into a
// session (detectSessionInUrl), then we route based on onboarding state.
export default function AuthCallback() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    navigate(user ? "/dashboard" : "/login", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="anim-spin-slow h-8 w-8 rounded-full" style={{ border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} />
        <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Signing you in…</p>
      </div>
    </div>
  );
}

