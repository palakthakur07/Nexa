import { useState } from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useNexaDrawer } from "../context/NexaDrawerContext.jsx";

const SUGGESTIONS = ["Study abroad", "Find an internship", "Start a business", "Return to work", "Find a mentor", "Grow my career"];

export default function NexaDrawer() {
  const { open, closeDrawer } = useNexaDrawer();
  const [value, setValue] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/20 p-4 md:items-center" style={{ backdropFilter: "blur(2px)" }} onClick={closeDrawer}>
      <div className="anim-drawer nexa-panel w-full max-w-md rounded-[var(--radius-xl)] p-7" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="anim-glow flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "var(--accent-strong)" }}><Sparkles size={14} color="#fff" /></div>
            <span className="font-display text-[17px]">Nexa</span>
          </div>
          <button onClick={closeDrawer} aria-label="Close" className="t-fast rounded-full p-1.5 hover:bg-[var(--surface-muted)]"><X size={18} style={{ color: "var(--text-secondary)" }} /></button>
        </div>
        <p className="font-display mt-5 text-[1.5rem] leading-snug">Tell me what you're working toward.</p>
        <div className="nexa-ai-input t-standard mt-5 flex items-center gap-2.5 rounded-full py-2.5 pl-4 pr-2.5">
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="What are you hoping to do next?" className="w-full bg-transparent text-[14px] outline-none" />
          <button aria-label="Send" className="nexa-btn-primary t-spring flex shrink-0 items-center justify-center rounded-full" style={{ width: 36, height: 36 }}><ArrowRight size={15} /></button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => setValue(s)} className="chip t-fast rounded-full px-3 py-1.5 text-[12.5px] font-medium">{s}</button>
          ))}
        </div>
        <div className="mt-5 text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>
          Full conversational assistant preview — real intelligence arrives in a later phase.
        </div>
      </div>
    </div>
  );
}
