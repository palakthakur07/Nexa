import { Check } from "lucide-react";

export default function Chip({ children, selected, onClick, disabled }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} data-selected={selected} aria-pressed={selected}
      className="chip t-fast inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium"
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      {selected && <Check size={13} />}
      {children}
    </button>
  );
}
