import { HelpCircle, Check, AlertCircle } from "lucide-react";

// Heuristic only — NEXA doesn't verify eligibility, so this deliberately
// never claims certainty. "Likely match" only appears when the profile
// directly supports it (career stage keyword match); everything else is
// "Needs review" or "Not enough information".
function statusFor(item, profile) {
  const lower = item.toLowerCase();
  if (profile.careerStage && lower.includes(profile.careerStage.toLowerCase())) {
    return { label: "Looks aligned", icon: Check, tone: "success" };
  }
  if (lower.includes("woman") || lower.includes("women")) {
    return { label: "Not enough information", icon: HelpCircle, tone: "muted" };
  }
  return { label: "Review requirement", icon: AlertCircle, tone: "warning" };
}

const TONE = {
  success: { bg: "var(--success-soft)", fg: "var(--success)" },
  warning: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  muted: { bg: "var(--surface-muted)", fg: "var(--text-tertiary)" },
};

export default function EligibilitySection({ eligibility, profile }) {
  return (
    <div className="space-y-2.5">
      {eligibility.map((item) => {
        const status = statusFor(item, profile);
        const tone = TONE[status.tone];
        return (
          <div key={item} className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] p-3.5" style={{ background: "var(--surface-muted)" }}>
            <span className="text-[13.5px]" style={{ color: "var(--text-primary)" }}>{item}</span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: tone.bg, color: tone.fg }}>
              <status.icon size={12} /> {status.label}
            </span>
          </div>
        );
      })}
      <p className="pt-1 text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>
        NEXA hasn't verified eligibility — always confirm requirements directly with the organization.
      </p>
    </div>
  );
}
