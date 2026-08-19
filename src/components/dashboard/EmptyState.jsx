export default function EmptyState({ icon: Icon, text }) {
  return (
    <div className="nexa-card flex flex-col items-center gap-2 rounded-[var(--radius-md)] p-6 text-center">
      <Icon size={20} style={{ color: "var(--text-tertiary)" }} />
      <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{text}</p>
    </div>
  );
}
