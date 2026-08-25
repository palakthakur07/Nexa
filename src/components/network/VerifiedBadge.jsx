import { ShieldCheck } from "lucide-react";

// Renders ONLY when the mentor's real `verified` column is true — that
// flag is admin-set (see schema.sql protect_mentor_verified trigger), a
// mentor can never set it on themselves. Renders nothing at all otherwise;
// there is no "unverified" badge either, since the absence of the badge
// already communicates that.
export default function VerifiedBadge({ verified }) {
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
      <ShieldCheck size={12} /> Verified
    </span>
  );
}
