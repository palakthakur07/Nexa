import { useState } from "react";
import { MoreVertical, Flag, Ban, X } from "lucide-react";
import Button from "../ui/Button.jsx";
import { blockUser, submitReport } from "../../lib/dataService.js";
import { useAuth } from "../../context/AuthContext.jsx";

const REASONS = ["Harassment", "Inappropriate messages", "Spam", "Impersonation", "Misleading information", "Other"];

export default function ReportBlockMenu({ reportedUserId, connectionRequestId = null, onBlocked }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // null | 'report' | 'block-confirm'
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null); // 'reported' | 'blocked'

  async function handleReport(e) {
    e.preventDefault();
    if (!reason) return;
    setSaving(true);
    try {
      await submitReport(user.id, reportedUserId, reason, details.trim() || null, connectionRequestId);
      setDone("reported");
    } finally {
      setSaving(false);
    }
  }

  async function handleBlock() {
    setSaving(true);
    try {
      await blockUser(user.id, reportedUserId);
      setDone("blocked");
      onBlocked?.();
    } finally {
      setSaving(false);
    }
  }

  function close() { setOpen(false); setMode(null); setReason(""); setDetails(""); setDone(null); }

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="More options" className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}>
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} />
          <div className="nexa-panel absolute right-0 top-10 z-40 w-72 rounded-[var(--radius-md)] p-3.5" style={{ background: "var(--surface)" }}>
            {done === "reported" && <div className="text-[13px]" style={{ color: "var(--success)" }}>Report submitted — thank you.</div>}
            {done === "blocked" && <div className="text-[13px]" style={{ color: "var(--success)" }}>Blocked. They can no longer contact you.</div>}

            {!done && mode === null && (
              <div className="space-y-1">
                <button onClick={() => setMode("report")} className="t-fast flex w-full items-center gap-2 rounded-[var(--radius-sm)] p-2 text-left text-[13px]"><Flag size={14} /> Report</button>
                <button onClick={() => setMode("block-confirm")} className="t-fast flex w-full items-center gap-2 rounded-[var(--radius-sm)] p-2 text-left text-[13px]" style={{ color: "var(--danger, #b91c1c)" }}><Ban size={14} /> Block</button>
              </div>
            )}

            {!done && mode === "report" && (
              <form onSubmit={handleReport}>
                <div className="mb-2 flex items-center justify-between text-[13px] font-semibold">Report<button type="button" onClick={close} aria-label="Close"><X size={14} /></button></div>
                <select required value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-[var(--radius-sm)] border px-2.5 py-2 text-[12.5px]" style={{ borderColor: "var(--border)" }}>
                  <option value="">Select a reason…</option>
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={2} placeholder="Optional details" className="mt-2 w-full resize-none rounded-[var(--radius-sm)] border px-2.5 py-2 text-[12.5px]" style={{ borderColor: "var(--border)" }} />
                <div className="mt-2 flex justify-end"><Button variant="primary" size="sm" type="submit" disabled={!reason || saving}>{saving ? "Submitting…" : "Submit report"}</Button></div>
              </form>
            )}

            {!done && mode === "block-confirm" && (
              <div>
                <div className="text-[13px]">Block this person? They won't be able to send you requests, and you won't see them in the directory.</div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setMode(null)}>Cancel</Button>
                  <Button variant="primary" size="sm" onClick={handleBlock} disabled={saving}>{saving ? "Blocking…" : "Block"}</Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
