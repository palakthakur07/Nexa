export default function SuggestionChip({ children, icon: Icon, onClick }) {
  return (
    <button onClick={onClick} className="chip t-fast inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-left text-[13px] font-medium">
      {Icon && <Icon size={14} className="shrink-0" style={{ color: "var(--accent-strong)" }} />}
      {children}
    </button>
  );
}
