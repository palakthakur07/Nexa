import { Check } from "lucide-react";

export default function SelectCard({ label, description, icon: Icon, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} data-selected={selected} aria-pressed={selected} className="select-card t-fast flex items-center gap-3 rounded-[var(--radius-md)] p-4 text-left">
      {Icon && (
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: selected ? "var(--accent-strong)" : "var(--surface-muted)", color: selected ? "#fff" : "var(--accent-strong)" }}
        >
          <Icon size={16} />
        </div>
      )}
      <div className="flex-1">
        <div className="text-[14px] font-semibold">{label}</div>
        {description && <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{description}</div>}
      </div>
      {selected && <Check size={16} style={{ color: "var(--accent-strong)" }} />}
    </button>
  );
}
