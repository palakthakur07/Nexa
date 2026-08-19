import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import Button from "../ui/Button.jsx";
import VerifiedBadge from "./VerifiedBadge.jsx";

// Connects opportunity discovery to human experience — shown on /discover
// beneath the featured opportunity.
export default function SomeoneWhosBeenThere({ woman }) {
  const navigate = useNavigate();
  if (!woman) return null;
  const initials = woman.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div className="nexa-card flex flex-col items-center gap-4 rounded-[var(--radius-lg)] p-6 text-center sm:flex-row sm:items-center sm:text-left">
      <Avatar initials={initials} size={48} />
      <div className="flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Someone who's been there</div>
        <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Before you apply, NEXA thinks you might benefit from talking to <b style={{ color: "var(--text-primary)" }}>{woman.name}</b> — {woman.headline.toLowerCase()}.
        </p>
        <div className="mt-1.5"><VerifiedBadge /></div>
      </div>
      <Button variant="secondary" icon={ArrowRight} iconRight onClick={() => navigate(`/network/${woman.id}`)}>Meet her</Button>
    </div>
  );
}
