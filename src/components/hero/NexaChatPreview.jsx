import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, Sparkles } from "lucide-react";
import logoSrc from "../../assets/logo.png";

// Rendered inside the MacBook screen cutout on the landing hero. An ongoing
// conversation between a user and NEXA AI, animated in on a loop — a
// concrete look at what using NEXA actually feels like, rather than an
// abstract feature diagram. Deliberately a single message thread (not the
// reference's dual-pane inbox) since the laptop screen here is small and one
// thread reads far more clearly at that size. No stock photos of real
// people — avatars are initials, same pattern as the rest of the app's
// Avatar.jsx, since a hotlinked photo would imply a specific real person
// endorsed this product.
const MESSAGES = [
  { id: 1, from: "user", text: "hey! any scholarships for first-gen students studying CS?" },
  { id: 2, from: "nexa", text: "Found one that fits well — the Women in Tech Scholarship, $10,000, deadline in 12 days. Want the details?" },
  { id: 3, from: "user", text: "yes please!! this is exactly what i needed 🙌" },
  { id: 4, from: "nexa", text: "Saved it to your list and added \"Finish application draft\" to your roadmap. You've got this 🎉" },
];

const STEP_MS = [700, 1500, 1300, 1500, 1300]; // delay before each message appears, then a hold at the end

export default function NexaChatPreview() {
  const [shown, setShown] = useState(0); // how many messages are visible
  const [typing, setTyping] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    let mounted = true;
    const timers = [];
    setShown(0);
    setTyping(false);

    let elapsed = 0;
    MESSAGES.forEach((m, i) => {
      elapsed += STEP_MS[i];
      if (m.from === "nexa") {
        // brief typing indicator before an AI reply lands
        timers.push(setTimeout(() => { if (mounted) setTyping(true); }, elapsed - 550));
      }
      timers.push(setTimeout(() => {
        if (!mounted) return;
        setTyping(false);
        setShown(i + 1);
      }, elapsed));
    });
    const resetAt = elapsed + STEP_MS[STEP_MS.length - 1] + 1400;
    timers.push(setTimeout(() => { if (mounted) setCycle((c) => c + 1); }, resetAt));

    return () => { mounted = false; timers.forEach(clearTimeout); };
  }, [cycle]);

  const visible = MESSAGES.slice(0, shown);

  return (
    <div className="relative flex h-full w-full flex-col" style={{ background: "var(--bg)" }}>
      <style>{`
        @keyframes nexaChatDot { 0%,60%,100% { opacity: 0.35; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } }
        .nexa-chat-dot { animation: nexaChatDot 1.1s ease-in-out infinite; }
      `}</style>

      {/* Mini chat-app header — avatar, name, live status. */}
      <div className="flex shrink-0 items-center gap-2 border-b px-[4%] py-[2.4%]" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ width: "1.9em", height: "1.9em", fontSize: 11 }}>
          <img src={logoSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="font-display truncate font-semibold" style={{ fontSize: "0.85em", color: "var(--text-primary)" }}>NEXA</span>
          <span className="flex items-center gap-1" style={{ fontSize: "0.62em", color: "var(--success, #4c9a6a)" }}>
            <span className="rounded-full" style={{ width: 5, height: 5, background: "currentColor" }} />
            online
          </span>
        </div>
        <div className="ml-auto flex shrink-0 items-center justify-center rounded-full" style={{ width: "1.7em", height: "1.7em", background: "var(--accent-soft)", color: "var(--accent-strong)" }}>
          <Sparkles size={11} />
        </div>
      </div>

      {/* Message thread */}
      <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden px-[4%] py-[3.5%]" style={{ fontSize: "clamp(8px, 2.3vw, 12.5px)" }}>
        <AnimatePresence mode="popLayout">
          {visible.map((m) => {
            const isUser = m.from === "user";
            return (
              <motion.div
                key={`${cycle}-${m.id}`}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[78%] rounded-[10px] px-3 py-1.5"
                  style={{
                    background: isUser ? "var(--accent-soft)" : "var(--surface)",
                    border: isUser ? "1px solid var(--accent)" : "1px solid var(--border)",
                    borderBottomRightRadius: isUser ? 3 : 10,
                    borderBottomLeftRadius: isUser ? 10 : 3,
                  }}
                >
                  <div style={{ lineHeight: 1.4, color: "var(--text-primary)" }}>{m.text}</div>
                  {isUser && (
                    <div className="mt-0.5 flex justify-end">
                      <CheckCheck size={11} style={{ color: "var(--accent-strong)" }} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {typing && (
            <motion.div key={`typing-${cycle}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="flex items-center gap-1 rounded-[10px] px-3 py-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderBottomLeftRadius: 3 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="nexa-chat-dot rounded-full" style={{ width: 5, height: 5, background: "var(--accent-strong)", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Static composer bar — decorative, matches the real MessageComposer's shape */}
      <div className="flex shrink-0 items-center gap-2 border-t px-[4%] py-[2.6%]" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex-1 rounded-full px-3 py-1" style={{ background: "var(--surface-muted)", fontSize: "0.7em", color: "var(--text-tertiary)" }}>Ask NEXA anything...</div>
        <div className="flex shrink-0 items-center justify-center rounded-full" style={{ width: "1.7em", height: "1.7em", background: "var(--accent-strong)", color: "#fff" }}>
          <Sparkles size={10} />
        </div>
      </div>
    </div>
  );
}