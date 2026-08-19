import { deadlineStatus } from "../../lib/deadline.js";

const TONE_STYLES = {
  accent: { bg: "var(--accent-soft)", fg: "var(--accent-strong)" },
  warning: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  neutral: { bg: "var(--surface-muted)", fg: "var(--text-secondary)" },
  muted: { bg: "var(--surface-muted)", fg: "var(--text-tertiary)" },
};

export default function DeadlineBadge({ deadline }) {
  const status = deadlineStatus(deadline);
  const style = TONE_STYLES[status.tone];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: style.bg, color: style.fg }}>
      {status.label}
    </span>
  );
}
