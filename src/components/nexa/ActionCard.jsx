import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";

// Renders a real interactive action, not a fake markdown link. onRun
// performs the actual state change (save, navigate, add to roadmap, etc.)
// and returns a short confirmation string shown in place of the button.
export default function ActionCard({ action, onRun }) {
  const [done, setDone] = useState(null);

  const handleClick = () => {
    const confirmation = onRun(action);
    if (confirmation) setDone(confirmation);
  };

  if (done) {
    return (
      <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
        <Check size={13} /> {done}
      </div>
    );
  }

  return (
    <button onClick={handleClick} className="nexa-btn-secondary t-fast mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold">
      {action.label} <ArrowUpRight size={13} />
    </button>
  );
}
