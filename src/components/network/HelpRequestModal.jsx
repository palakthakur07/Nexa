import { useState } from "react";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import Button from "../ui/Button.jsx";
import Chip from "../ui/Chip.jsx";
import { REQUEST_TYPES } from "../../data/networkOptions.js";

const STEPS = ["topic", "message", "type", "preview"];

export default function HelpRequestModal({ woman, open, onClose, onSend }) {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [requestType, setRequestType] = useState("");
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const key = STEPS[step];
  const canProceed = { topic: !!topic, message: message.trim().length > 0, type: !!requestType, preview: true }[key];

  const reset = () => { setStep(0); setTopic(""); setMessage(""); setRequestType(""); setSent(false); };
  const close = () => { reset(); onClose(); };
  const send = () => { onSend({ topic, requestType, message }); setSent(true); };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/20 p-4 md:items-center" style={{ backdropFilter: "blur(2px)" }} onClick={close}>
      <div className="anim-drawer nexa-panel w-full max-w-md rounded-[var(--radius-xl)] p-7" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="text-[15px] font-semibold">Ask {woman.name.split(" ")[0]} for help</div>
          <button onClick={close} aria-label="Close" className="t-fast rounded-full p-1.5 hover:bg-[var(--surface-muted)]"><X size={18} style={{ color: "var(--text-secondary)" }} /></button>
        </div>

        {sent ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--success-soft)" }}><Check size={20} style={{ color: "var(--success)" }} /></div>
            <div className="font-display mt-4 text-[1.4rem]">Request sent.</div>
            <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>You'll see her response here if she accepts.</p>
            <Button variant="primary" onClick={close}>Done</Button>
          </div>
        ) : (
          <>
            {key === "topic" && (
              <div className="mt-5">
                <div className="font-display text-[1.3rem]">What would you like help with?</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {woman.canHelpWith.map((t) => <Chip key={t} selected={topic === t} onClick={() => setTopic(t)}>{t}</Chip>)}
                </div>
              </div>
            )}
            {key === "message" && (
              <div className="mt-5">
                <div className="font-display text-[1.3rem]">Tell her a little more.</div>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                  placeholder="I'm applying for AI master's programs and I'm not sure how to approach scholarships."
                  className="nexa-input t-fast mt-4 w-full resize-none rounded-[var(--radius-md)] p-3.5 text-[13.5px] outline-none"
                />
              </div>
            )}
            {key === "type" && (
              <div className="mt-5">
                <div className="font-display text-[1.3rem]">What would you like from her?</div>
                <div className="mt-4 flex flex-wrap gap-2">{REQUEST_TYPES.map((t) => <Chip key={t} selected={requestType === t} onClick={() => setRequestType(t)}>{t}</Chip>)}</div>
              </div>
            )}
            {key === "preview" && (
              <div className="mt-5 space-y-3">
                <div className="font-display text-[1.3rem]">Review your request</div>
                <div className="nexa-card space-y-2.5 rounded-[var(--radius-md)] p-4 text-[13px]">
                  <div><span style={{ color: "var(--text-tertiary)" }}>To</span> <b>{woman.name}</b></div>
                  <div><span style={{ color: "var(--text-tertiary)" }}>You're asking about</span> <b>{topic}</b></div>
                  <div><span style={{ color: "var(--text-tertiary)" }}>Your message</span><div className="mt-1" style={{ color: "var(--text-primary)" }}>{message}</div></div>
                  <div><span style={{ color: "var(--text-tertiary)" }}>Request type</span> <b>{requestType}</b></div>
                </div>
                <p className="text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>Be respectful. Share only what you're comfortable sharing.</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              {step > 0 ? (
                <button onClick={() => setStep((s) => s - 1)} className="t-fast inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}><ArrowLeft size={14} /> Back</button>
              ) : <span />}
              {key === "preview" ? (
                <Button variant="primary" onClick={send}>Send request</Button>
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
