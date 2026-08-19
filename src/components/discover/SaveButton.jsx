import { Check, Bookmark } from "lucide-react";
import { useSaved } from "../../context/SavedContext.jsx";

// Text + icon, never icon-only — status must be readable, not just implied.
export default function SaveButton({ id, size = "md" }) {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(id);
  const sizeClass = size === "sm" ? "text-[12.5px] px-3 py-1.5 gap-1.5" : "text-[14px] px-4 py-2.5 gap-2";
  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggleSave(id); }}
      aria-pressed={saved}
      className={`t-fast inline-flex items-center justify-center rounded-full font-semibold ${sizeClass}`}
      style={{ background: saved ? "var(--success-soft)" : "var(--surface)", color: saved ? "var(--success)" : "var(--text-primary)", border: `1px solid ${saved ? "var(--success)" : "var(--border-strong)"}` }}
    >
      {saved ? <Check size={14} /> : <Bookmark size={14} />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
