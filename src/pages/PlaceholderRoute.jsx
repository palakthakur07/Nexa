import { useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";
import { useProfile } from "../context/ProfileContext.jsx";

// "discover" and "people" (now /network) used to live here — both are real
// pages now. Only /roadmap remains a lightweight placeholder.
const CONTENT = {
  roadmap: { title: "Roadmap", eyebrow: "/roadmap", copy: "This is where your goal becomes a personalized, trackable plan — see a live version of it on your dashboard.", icon: MapPin },
};

export default function PlaceholderRoute({ route }) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const r = CONTENT[route];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}><r.icon size={24} style={{ color: "var(--accent-strong)" }} /></div>
      <div className="mt-5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>{r.eyebrow}</div>
      <h1 className="font-display mt-2 text-[2.2rem]">{r.title}</h1>
      <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.copy}</p>
      <button onClick={() => navigate(profile.onboardingComplete ? "/dashboard" : "/")} className="t-fast mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>
        <ArrowLeft size={15} /> Back to NEXA
      </button>
    </div>
  );
}
