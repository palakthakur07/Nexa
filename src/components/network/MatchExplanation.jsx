import { Check } from "lucide-react";

export default function MatchExplanation({ reasons, title = "Why NEXA recommends her" }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>{title}</div>
      <ul className="mt-2.5 space-y-1.5">
        {reasons.map((r) => (
          <li key={r} className="flex items-start gap-2 text-[13.5px]">
            <Check size={15} className="mt-0.5 shrink-0" style={{ color: "var(--success)" }} /> {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
