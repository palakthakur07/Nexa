import { Search, X } from "lucide-react";

export default function OpportunitySearch({ value, onChange }) {
  return (
    <div className="nexa-input t-fast flex items-center gap-2.5 rounded-full px-4 py-2.5">
      <Search size={16} style={{ color: "var(--text-tertiary)" }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search opportunities..."
        aria-label="Search opportunities"
        className="w-full bg-transparent text-[13.5px] outline-none"
      />
      {value && (
        <button onClick={() => onChange("")} aria-label="Clear search" className="t-fast flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}>
          <X size={12} />
        </button>
      )}
    </div>
  );
}
