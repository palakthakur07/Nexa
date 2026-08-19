import MatchRing from "../ui/MatchRing.jsx";

// Wraps MatchRing with the "94% MATCH" label used across Discover — kept
// separate from the plain ring so featured/detail contexts can add copy
// without every consumer of MatchRing carrying that text.
export default function MatchScore({ value, size = 56, showLabel = true }) {
  return (
    <div className="flex items-center gap-3">
      <MatchRing value={value} size={size} />
      {showLabel && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Match</div>
          <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Based on your NEXA profile</div>
        </div>
      )}
    </div>
  );
}
