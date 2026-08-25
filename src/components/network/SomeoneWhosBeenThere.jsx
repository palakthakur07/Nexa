import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import Button from "../ui/Button.jsx";
import VerifiedBadge from "./VerifiedBadge.jsx";

// Renders only if a real, validated mentor exists. No mock fallbacks allowed.
export default function SomeoneWhosBeenThere({ mentor }) {
  const navigate = useNavigate();

  // Strict check: if the mentor isn't real/verified or doesn't exist, render nothing at all.
  if (!mentor || !mentor.verified) return null;

  const initials = mentor.name ? mentor.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "";

  return (
    <div className="nexa-card flex flex-col items-center gap-4 rounded-[var(--radius-lg)] p-6 text-center sm:flex-row sm:items-center sm:text-left">
      <Avatar initials={initials} photoUrl={mentor.photoUrl} size={48} />
      <div className="flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
          Someone who's been there
        </div>
        <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Before you apply, NEXA thinks you might benefit from talking to <b style={{ color: "var(--text-primary)" }}>{mentor.name}</b> {mentor.headline ? `— ${mentor.headline.toLowerCase()}` : ""}.
        </p>
        <div className="mt-1.5">
          <VerifiedBadge verified={true} />
        </div>
      </div>
      <Button variant="secondary" icon={ArrowRight} iconRight onClick={() => navigate(`/network/${mentor.id}`)}>
        View profile
      </Button>
    </div>
  );
}