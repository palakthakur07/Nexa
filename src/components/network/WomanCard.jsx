import { useNavigate } from "react-router-dom";
import Badge from "../ui/Badge.jsx";
import Avatar from "../ui/Avatar.jsx";
import MatchRing from "../ui/MatchRing.jsx";
import VerifiedBadge from "./VerifiedBadge.jsx";

// No follower counts, no likes, no post counts — just the signals that
// actually matter for finding someone who's been there.
export default function WomanCard({ woman, match }) {
  const navigate = useNavigate();
  const initials = woman.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div
      role="button" tabIndex={0}
      onClick={() => navigate(`/network/${woman.id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/network/${woman.id}`)}
      className="nexa-card t-standard cursor-pointer rounded-[var(--radius-lg)] p-5 hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar initials={initials} size={44} />
          <div>
            <div className="text-[14.5px] font-semibold leading-snug">{woman.name}</div>
            <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{woman.headline}</div>
            <div className="text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>{woman.location}</div>
          </div>
        </div>
        <MatchRing value={match} size={40} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">{woman.experience.slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}</div>

      <div className="mt-3">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Can help with</div>
        <div className="mt-1 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>{woman.canHelpWith.slice(0, 2).join(" · ")}</div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <VerifiedBadge />
        <span className="t-fast text-[12.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>View profile →</span>
      </div>
    </div>
  );
}
