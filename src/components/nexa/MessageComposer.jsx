import { useState, useRef } from "react";
import { ArrowRight, Paperclip } from "lucide-react";

export default function MessageComposer({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="nexa-composer-wrap relative">
      <div aria-hidden="true" className="nexa-composer-glow pointer-events-none absolute -inset-2" />
      <div className="nexa-ai-input t-standard relative flex items-end gap-2.5 rounded-[var(--radius-lg)] p-2.5">
        <button type="button" aria-label="Attach (not available yet)" disabled className="t-fast flex h-9 w-9 shrink-0 items-center justify-center rounded-full opacity-40" style={{ color: "var(--text-tertiary)" }}>
          <Paperclip size={16} />
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask NEXA anything..."
          rows={1}
          aria-label="Message NEXA"
          className="max-h-32 min-h-[36px] w-full resize-none border-0 bg-transparent px-1 py-2 text-[14px] outline-none"
          style={{ color: "var(--text-primary)" }}
        />
        <button
          onClick={send} disabled={!value.trim() || disabled} aria-label="Send message"
          className="nexa-btn-primary t-spring flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ opacity: !value.trim() || disabled ? 0.4 : 1 }}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
