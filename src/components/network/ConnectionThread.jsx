import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchConnectionMessages, sendConnectionMessage } from "../../lib/dataService.js";

export default function ConnectionThread({ requestId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const rows = await fetchConnectionMessages(requestId);
      if (alive) { setMessages(rows); setLoading(false); }
    }
    load();
    // Light polling instead of a realtime subscription — keeps this to
    // plain REST calls, no extra Supabase Realtime setup required.
    const interval = setInterval(load, 8000);
    return () => { alive = false; clearInterval(interval); };
  }, [requestId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "nearest" }); }, [messages.length]);

  async function handleSend(e) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft("");
    try {
      const row = await sendConnectionMessage(requestId, user.id, body);
      setMessages((prev) => [...prev, row]);
    } catch {
      setDraft(body); // restore on failure so nothing is silently lost
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="nexa-card flex h-[420px] flex-col rounded-[var(--radius-lg)] p-4">
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="anim-spin-slow h-6 w-6 rounded-full" style={{ border: "2.5px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            You're connected — say hello.
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[78%] rounded-[var(--radius-md)] px-3.5 py-2 text-[13.5px]"
                  style={{
                    background: mine ? "var(--accent-strong)" : "var(--surface-muted)",
                    color: mine ? "#fff" : "var(--text-primary)",
                    borderTopRightRadius: mine ? 4 : undefined,
                    borderTopLeftRadius: mine ? undefined : 4,
                  }}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
        <input
          value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          className="nexa-input t-fast flex-1 rounded-full px-4 py-2.5 text-[13.5px] outline-none"
        />
        <button type="submit" disabled={!draft.trim() || sending} aria-label="Send" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--accent-strong)", color: "#fff", opacity: !draft.trim() || sending ? 0.5 : 1 }}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
