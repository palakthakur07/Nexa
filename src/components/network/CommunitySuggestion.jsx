import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useProfile } from "../../context/ProfileContext.jsx";
import { rankCommunities } from "../../lib/communityMatching.js";

// Reuses the shared catalog (Supabase-backed, with the same offline
// fallback as opportunities/mentors) — no separately hardcoded data.
// Ranked against the user's own profile so it changes as their
// interests/priorities change, instead of always showing the same fixed set.
export default function CommunitySuggestion() {
  const { communities } = useCatalog();
  const { profile } = useProfile();
  const ranked = rankCommunities(profile, communities, 4);
  return (
    <div className="nexa-card rounded-[var(--radius-lg)] p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>You may also like</div>
      <div className="mt-3 space-y-2.5">
        {ranked.map((c) => {
          const Row = c.url ? "a" : "div";
          const rowProps = c.url ? { href: c.url, target: "_blank", rel: "noopener noreferrer" } : {};
          return (
            <Row
              key={c.id}
              className="flex items-center justify-between group"
              style={c.url ? { cursor: "pointer" } : undefined}
              {...rowProps}
            >
              <div><div className="text-[13px] font-semibold">{c.name}</div><div className="text-[11.5px]" style={{ color: "var(--text-secondary)" }}>{c.category}</div></div>
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: "var(--text-tertiary)" }} />
            </Row>
          );
        })}
      </div>
    </div>
  );
}