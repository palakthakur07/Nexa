import { Check, Clock, UserPlus } from "lucide-react";

// Not connected -> Request sent -> Connected. Never claims a real message
// was delivered anywhere beyond this demo's local state.
export default function ConnectionStatus({ status }) {
  if (status === "connected") {
    return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: "var(--success-soft)", color: "var(--success)" }}><Check size={13} /> Connected</span>;
  }
  if (status === "pending") {
    return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}><Clock size={13} /> Request sent</span>;
  }
  return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}><UserPlus size={13} /> Not connected</span>;
}
