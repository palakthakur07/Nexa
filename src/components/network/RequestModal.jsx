import { useState } from "react";
import { X, ArrowLeft, ArrowRight, Check, AlertCircle } from "lucide-react";
import Button from "../ui/Button.jsx";
import Chip from "../ui/Chip.jsx";
import { REQUEST_TYPES } from "../../data/networkOptions.js";

const STEPS = ["topic", "message", "type", "preview"];

// One initial message only — this is the entire "request guidance" flow.
// No further messages can be sent from here; that only becomes possible
// once the mentor accepts (see ConnectionThread.jsx), enforced by RLS on
// connection_messages, not just by this UI hiding a button.
export default function RequestModal({ mentor, open, onClose, onSend }) {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [requestType, setRequestType] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const key = STEPS[step];
  const canProceed = { topic: !!topic, message: message.trim().length > 0, type: !!requestType, preview: true }[key];

  const reset = () => { setStep(0); setTopic(""); setMessage(""); setRequestType(""); setSent(false); setError(null); };
  const close = () => { reset(); onClose(); };
  const send = async () => {
    setSending(true);
    setError(null);
    try {
      await onSend({ topic, requestType, message });
      setSent(true);
    } catch (err) {
      // Real backend rejections surface here verbatim — daily limit reached,
      // duplicate pending request, blocked, etc. Never silently swallowed.
      setError(err.message || "Couldn't send that request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/20 p-4 md:items-center" style={{ backdropFilter: "blur(2px)" }} onClick={close}>
      <div className="anim-drawer nexa-panel w-full max-w-md rounded-[var(--radius-xl)] p-7" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="text-[15px] font-semibold">Request guidance from {mentor.name.split(" ")[0]}</div>
          <button onClick={close} aria-label="Close" className="t-fast rounded-full p-1.5 hover:bg-[var(--surface-muted)]"><X size={18} style={{ color: "var(--text-secondary)" }} /></button>
        </div>

        {sent ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--success-soft)" }}><Check size={20} style={{ color: "var(--success)" }} /></div>
            <div className="font-display mt-4 text-[1.4rem]">Request sent.</div>
            <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>You'll be notified here if they accept — you can find this under Requests any time.</p>
            <Button variant="primary" onClick={close}>Done</Button>
          </div>
        ) : (
          <>
            {key === "topic" && (
              <div className="mt-5">
                <div className="font-display text-[1.3rem]">What would you like help with?</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(mentor.canHelpWith || []).map((t) => <Chip key={t} selected={topic === t} onClick={() => setTopic(t)}>{t}</Chip>)}
                </div>
              </div>
            )}
            {key === "message" && (
              <div className="mt-5">
                <div className="font-display text-[1.3rem]">Tell them a little more.</div>
                <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>This is your one opening message — further back-and-forth only opens if they accept.</p>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                  placeholder="I'm applying for AI master's programs and I'm not sure how to approach scholarships."
                  className="nexa-input t-fast mt-4 w-full resize-none rounded-[var(--radius-md)] p-3.5 text-[13.5px] outline-none"
                />
              </div>
            )}
            {key === "type" && (
              <div className="mt-5">
                <div className="font-display text-[1.3rem]">What would you like from them?</div>
                <div className="mt-4 flex flex-wrap gap-2">{REQUEST_TYPES.map((t) => <Chip key={t} selected={requestType === t} onClick={() => setRequestType(t)}>{t}</Chip>)}</div>
              </div>
            )}
            {key === "preview" && (
              <div className="mt-5 space-y-3">
                <div className="font-display text-[1.3rem]">Review your request</div>
                <div className="nexa-card space-y-2.5 rounded-[var(--radius-md)] p-4 text-[13px]">
                  <div><span style={{ color: "var(--text-tertiary)" }}>To</span> <b>{mentor.name}</b></div>
                  <div><span style={{ color: "var(--text-tertiary)" }}>You're asking about</span> <b>{topic}</b></div>
                  <div><span style={{ color: "var(--text-tertiary)" }}>Your message</span><div className="mt-1" style={{ color: "var(--text-primary)" }}>{message}</div></div>
                  <div><span style={{ color: "var(--text-tertiary)" }}>Request type</span> <b>{requestType}</b></div>
                </div>
                <p className="text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>Be respectful. Share only what you're comfortable sharing — no contact details are exchanged unless they choose to share them after accepting.</p>
                {error && (
                  <div className="flex items-start gap-2 rounded-[var(--radius-md)] p-3 text-[12.5px]" style={{ background: "var(--danger-soft, #fef2f2)", color: "var(--danger, #b91c1c)" }}>
                    <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              {step > 0 ? (
                <button onClick={() => setStep((s) => s - 1)} className="t-fast inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}><ArrowLeft size={14} /> Back</button>
              ) : <span />}
              {key === "preview" ? (
                <Button variant="primary" onClick={send} disabled={sending}>{sending ? "Sending…" : "Send request"}</Button>
              ) : (
                <Button variant="primary" icon={ArrowRight} iconRight disabled={!canProceed} onClick={() => setStep((s) => s + 1)}>Continue</Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
