import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Check, CircleDot } from "lucide-react";

const STAGES = ["Understanding your goals", "Finding relevant paths", "Matching opportunities", "Finding women who've been there", "Building your roadmap"];

// Simulated analysis only — no real AI call happens here. Duration is
// ~2.6s (near-instant under prefers-reduced-motion) before routing to
// the dashboard.
export default function Analysis() {
  const navigate = useNavigate();
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepMs = reduce ? 80 : 520;
    const timer = setInterval(() => {
      setStageIndex((i) => {
        if (i >= STAGES.length - 1) {
          clearInterval(timer);
          setTimeout(() => navigate("/dashboard"), reduce ? 100 : 500);
          return i;
        }
        return i + 1;
      });
    }, stepMs);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="anim-pulse flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--accent-strong)" }}><Sparkles size={22} color="#fff" /></div>
      <h1 className="font-display mt-6 text-[1.9rem]">NEXA is connecting the dots.</h1>
      <div className="mt-8 w-full space-y-3 text-left">
        {STAGES.map((s, i) => (
          <div key={s} className="flex items-center gap-3 text-[14px]" style={{ color: i <= stageIndex ? "var(--text-primary)" : "var(--text-tertiary)" }}>
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: i < stageIndex ? "var(--success-soft)" : i === stageIndex ? "var(--accent-soft)" : "var(--surface-muted)" }}>
              {i < stageIndex ? <Check size={12} style={{ color: "var(--success)" }} /> : i === stageIndex ? <div className="anim-spin-slow"><CircleDot size={11} style={{ color: "var(--accent-strong)" }} /></div> : null}
            </div>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
