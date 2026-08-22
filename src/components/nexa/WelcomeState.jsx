import { Compass, DollarSign, Map, Users, Calendar, Sparkles } from "lucide-react";
import NexaOrb from "./NexaOrb.jsx";
import SuggestionChip from "./SuggestionChip.jsx";

// Picks a representative icon for a dynamically-generated prompt string by
// keyword — prompts come from suggestedPrompts.js and vary per user/entry
// context, so this can't be a fixed lookup table.
function iconFor(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("fund")) return DollarSign;
  if (p.includes("roadmap") || p.includes("30-day") || p.includes("plan")) return Map;
  if (p.includes("talk") || p.includes("mentor") || p.includes("ask her") || p.includes("draft my request")) return Users;
  if (p.includes("next step") || p.includes("prioritize") || p.includes("eligible")) return Compass;
  if (p.includes("next 30 days") || p.includes("focus")) return Calendar;
  return Sparkles;
}

export default function WelcomeState({ prompts, onPick }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {/* Atmospheric backdrop — layered soft glows in the NEXA palette,
          standing in for the reference component's full-bleed hero image. */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[720px] -translate-x-1/2 -translate-y-[58%] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(140,75,87,0.14), rgba(140,75,87,0) 70%)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-[30%] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(201,123,134,0.16), rgba(201,123,134,0) 70%)" }} />

      <div className="relative">
        <div className="nexa-orb-glow pointer-events-none absolute inset-0" />
        <NexaOrb size={104} />
      </div>
      <h1 className="font-display mt-7 text-[2.3rem]">NEXA</h1>
      <p className="mt-1.5 text-[16px]" style={{ color: "var(--text-secondary)" }}>Your next step, figured out.</p>
      <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
        Ask me about your goals, opportunities, career, applications, or what to do next.
      </p>
      <div className="relative mt-9 flex max-w-xl flex-wrap justify-center gap-2.5">
        {prompts.map((p) => <SuggestionChip key={p} icon={iconFor(p)} onClick={() => onPick(p)}>{p}</SuggestionChip>)}
      </div>
    </div>
  );
}
