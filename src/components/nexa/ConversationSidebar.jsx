import { Plus, Trash2, Sparkles } from "lucide-react";

export default function ConversationSidebar({ conversations, activeId, onSelect, onNew, onDelete }) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center gap-2 px-1">
        <Sparkles size={15} style={{ color: "var(--accent-strong)" }} />
        <span className="font-display text-[15px]">NEXA</span>
      </div>
      <button onClick={onNew} className="nexa-btn-secondary t-fast mb-4 flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold">
        <Plus size={14} /> New conversation
      </button>
      <div className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Recent</div>
      <div className="no-scrollbar mt-2 flex-1 space-y-1 overflow-y-auto">
        {conversations.length === 0 && <p className="px-1 py-4 text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>No conversations yet.</p>}
        {conversations.map((c) => (
          <div key={c.id} className="group flex items-center gap-1">
            <button
              onClick={() => onSelect(c.id)}
              className="t-fast flex-1 truncate rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[13px]"
              style={{ background: c.id === activeId ? "var(--surface-muted)" : "transparent", color: c.id === activeId ? "var(--accent-strong)" : "var(--text-secondary)", fontWeight: c.id === activeId ? 600 : 500 }}
            >
              {c.title}
            </button>
            <button onClick={() => onDelete(c.id)} aria-label={`Delete ${c.title}`} className="t-fast rounded-full p-1.5 opacity-0 group-hover:opacity-100 hover:bg-[var(--surface-muted)]">
              <Trash2 size={13} style={{ color: "var(--text-tertiary)" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
