import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    <motion.div
      role="button" tabIndex={0}
      onClick={() => navigate(`/network/${woman.id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/network/${woman.id}`)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
      className="nexa-card cursor-pointer rounded-[var(--radius-lg)] p-5"
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
    </motion.div>
  );
}


