import NexaOrb from "./NexaOrb.jsx";
import SuggestionChip from "./SuggestionChip.jsx";

export default function WelcomeState({ prompts, onPick }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <NexaOrb />
      <h1 className="font-display mt-6 text-[2rem]">NEXA</h1>
      <p className="mt-1 text-[15px]" style={{ color: "var(--text-secondary)" }}>Your next step, figured out.</p>
      <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
        Ask me about your goals, opportunities, career, applications, or what to do next.
      </p>
      <div className="mt-7 flex max-w-lg flex-wrap justify-center gap-2">
        {prompts.map((p) => <SuggestionChip key={p} onClick={() => onPick(p)}>{p}</SuggestionChip>)}
      </div>
    </div>
  );
}
