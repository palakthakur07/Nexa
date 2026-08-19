import { ShieldCheck } from "lucide-react";

// Demo trust indicator — deliberately labeled "Demo verified" so the UI
// never implies real-world identity verification.
export default function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
      <ShieldCheck size={12} /> Demo verified
    </span>
  );
}
