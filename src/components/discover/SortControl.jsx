import { ChevronDown } from "lucide-react";

export const SORT_OPTIONS = [
  { key: "best-match", label: "Best match" },
  { key: "deadline", label: "Deadline soonest" },
  { key: "recent", label: "Recently added" },
  { key: "funding", label: "Highest funding" },
];

export default function SortControl({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort opportunities"
        className="nexa-input t-fast appearance-none rounded-full py-2.5 pl-4 pr-9 text-[13px] font-medium outline-none"
        style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}
      >
        {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
    </div>
  );
}
