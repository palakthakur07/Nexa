import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.jsx";

// No routes use this anymore — /roadmap (the last placeholder) now renders
// the real Roadmap page (pages/Roadmap.jsx). Kept as a small fallback shell
// in case a future route needs a lightweight "coming soon" state again.
const CONTENT = {};

export default function PlaceholderRoute({ route }) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const r = CONTENT[route];

  if (!r) {
    navigate(profile.onboardingComplete ? "/dashboard" : "/", { replace: true });
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}><r.icon size={24} style={{ color: "var(--accent-strong)" }} /></div>
      <div className="mt-5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>{r.eyebrow}</div>
      <h1 className="font-display mt-2 text-[2.2rem]">{r.title}</h1>
      <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.copy}</p>
      <button onClick={() => navigate(profile.onboardingComplete ? "/dashboard" : "/")} className="t-fast mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>
        Back to NEXA
      </button>
    </div>
  );
}
