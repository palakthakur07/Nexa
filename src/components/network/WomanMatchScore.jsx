import MatchRing from "../ui/MatchRing.jsx";

export default function WomanMatchScore({ value, size = 56 }) {
  return (
    <div className="flex items-center gap-3">
      <MatchRing value={value} size={size} />
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Match</div>
        <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Based on your NEXA profile</div>
      </div>
    </div>
  );
}
