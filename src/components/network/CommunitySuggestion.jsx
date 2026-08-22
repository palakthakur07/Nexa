import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext.jsx";

// Reuses the shared catalog (Supabase-backed, with the same offline
// fallback as opportunities/mentors) — no separately hardcoded data.
export default function CommunitySuggestion() {
  const { communities } = useCatalog();
  return (
    <div className="nexa-card rounded-[var(--radius-lg)] p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>You may also like</div>
      <div className="mt-3 space-y-2.5">
        {communities.slice(0, 4).map((c) => (
          <div key={c.id} className="flex items-center justify-between">
            <div><div className="text-[13px] font-semibold">{c.name}</div><div className="text-[11.5px]" style={{ color: "var(--text-secondary)" }}>{c.category}</div></div>
            <ArrowUpRight size={14} style={{ color: "var(--text-tertiary)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
