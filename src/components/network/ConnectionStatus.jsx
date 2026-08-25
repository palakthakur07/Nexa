import { Check, Clock, UserPlus } from "lucide-react";

// none -> pending -> accepted (matches connection_requests.status in
// schema.sql). Sourced from a real accepted request row — this can only
// ever say "Connected" because the mentor genuinely accepted.
export default function ConnectionStatus({ status }) {
  if (status === "accepted") {
    return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: "var(--success-soft)", color: "var(--success)" }}><Check size={13} /> Connected</span>;
  }
  if (status === "pending") {
    return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}><Clock size={13} /> Request sent</span>;
  }
  return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}><UserPlus size={13} /> Not connected</span>;
}
