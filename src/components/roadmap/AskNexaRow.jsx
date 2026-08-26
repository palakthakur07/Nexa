import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const PROMPTS = [
  "Why is this my next step?",
  "How can I complete this faster?",
  "Find opportunities related to this phase.",
  "What should I learn next?",
];

export default function AskNexaRow() {
  const navigate = useNavigate();
  const ask = (prompt) => navigate("/nexa", { state: { entryContext: { type: "roadmap" }, seedMessage: prompt } });
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
        <Sparkles size={12} /> Ask NEXA about your roadmap
      </div>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button key={p} onClick={() => ask(p)} className="chip t-fast rounded-full px-3.5 py-2 text-[12.5px] font-medium">
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
