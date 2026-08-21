import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, PanelRightOpen, X } from "lucide-react";
import ConversationSidebar from "../components/nexa/ConversationSidebar.jsx";
import ContextPanel from "../components/nexa/ContextPanel.jsx";
import WelcomeState from "../components/nexa/WelcomeState.jsx";
import MessageComposer from "../components/nexa/MessageComposer.jsx";
import UserMessage from "../components/nexa/UserMessage.jsx";
import NexaMessage from "../components/nexa/NexaMessage.jsx";
import TypingIndicator from "../components/nexa/TypingIndicator.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useSaved } from "../context/SavedContext.jsx";
import { useConnections } from "../context/ConnectionsContext.jsx";
import { useConversations } from "../context/ConversationsContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { buildNexaContext } from "../lib/nexaContext.js";
import { askNexa } from "../lib/nexaAIService.js";
import { generateSuggestedPrompts } from "../lib/suggestedPrompts.js";

export default function Nexa() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, addRoadmapItem } = useProfile();
  const { saved, toggleSave } = useSaved();
  const { connections } = useConnections();
  const { conversations, activeId, setActiveId, createConversation, addMessage, deleteConversation } = useConversations();
  const { opportunities, mentors } = useCatalog();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const seededRef = useRef(false);

  const active = conversations.find((c) => c.id === activeId) || null;
  const entryContext = active?.entryContext || null;

  const context = useMemo(
    () => buildNexaContext({ profile, saved, connections, entryContext, opportunities, women: mentors }),
    [profile, saved, connections, entryContext, opportunities, mentors]
  );

  // Seed a conversation from router state (contextual entry from
  // Discover/OpportunityDetail/Network/WomanDetail/Dashboard/Profile).
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const incoming = location.state?.entryContext || null;
    if (incoming) {
      const id = createConversation(incoming);
      const ctx = buildNexaContext({ profile, saved, connections, entryContext: incoming, opportunities, women: mentors });
      setThinking(true);
      askNexa("", ctx, []).then((res) => {
        addMessage(id, { id: `m-${Date.now()}`, role: "nexa", content: res.content, actions: res.actions, createdAt: new Date().toISOString() });
      }).finally(() => setThinking(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [active?.messages.length, thinking]);

  const prompts = useMemo(() => generateSuggestedPrompts(profile, entryContext), [profile, entryContext]);

  const send = useCallback(async (text) => {
    let id = activeId;
    if (!id) id = createConversation(null);
    addMessage(id, { id: `m-${Date.now()}`, role: "user", content: text, createdAt: new Date().toISOString() });
    setThinking(true);
    const conv = conversations.find((c) => c.id === id);
    const history = conv ? conv.messages : [];
    try {
      const res = await askNexa(text, context, history);
      addMessage(id, { id: `m-${Date.now() + 1}`, role: "nexa", content: res.content, actions: res.actions, createdAt: new Date().toISOString() });
    } catch {
      addMessage(id, { id: `m-${Date.now() + 1}`, role: "nexa", content: "NEXA couldn't connect right now.\n\nTry again in a moment.", actions: [{ type: "RETRY", label: "Try again" }], createdAt: new Date().toISOString() });
    } finally {
      setThinking(false);
    }
  }, [activeId, conversations, context, createConversation, addMessage]);

  const runAction = useCallback((action) => {
    switch (action.type) {
      case "OPEN_OPPORTUNITY": navigate(`/discover/${action.payload.id}`); return null;
      case "OPEN_WOMAN_PROFILE": navigate(`/network/${action.payload.id}`); return null;
      case "OPEN_DISCOVER": navigate("/discover"); return null;
      case "OPEN_NETWORK": navigate("/network"); return null;
      case "OPEN_PROFILE": navigate("/profile"); return null;
      case "VIEW_SAVED": navigate("/saved"); return null;
      case "VIEW_ROADMAP": navigate("/dashboard"); return null;
      case "SAVE_OPPORTUNITY": toggleSave(action.payload.id); return "Saved to your opportunities.";
      case "ADD_TO_ROADMAP": addRoadmapItem(action.payload.label); return "Added to your roadmap.";
      case "RETRY": return null;
      default: return null;
    }
  }, [navigate, toggleSave, addRoadmapItem]);

  return (
    <div className="mx-auto flex max-w-6xl" style={{ height: "calc(100vh - 65px)" }}>
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 lg:block" style={{ borderRight: "1px solid var(--border)" }}>
        <ConversationSidebar conversations={conversations} activeId={activeId} onSelect={setActiveId} onNew={() => createConversation(null)} onDelete={deleteConversation} />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="h-full w-72" style={{ background: "var(--bg)" }} onClick={(e) => e.stopPropagation()}>
            <ConversationSidebar conversations={conversations} activeId={activeId} onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }} onNew={() => { createConversation(null); setSidebarOpen(false); }} onDelete={deleteConversation} />
          </div>
          <div className="flex-1 bg-black/20" />
        </div>
      )}

      {/* Center conversation */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 lg:hidden" style={{ borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => setSidebarOpen(true)} aria-label="Conversations" className="t-fast rounded-full p-2 hover:bg-[var(--surface-muted)]"><Menu size={18} /></button>
          <span className="text-[13px] font-semibold">{active?.title || "NEXA"}</span>
          <button onClick={() => setContextOpen(true)} aria-label="Context" className="t-fast rounded-full p-2 hover:bg-[var(--surface-muted)]"><PanelRightOpen size={18} /></button>
        </div>

        {(!active || active.messages.length === 0) && !thinking ? (
          <WelcomeState prompts={prompts} onPick={send} />
        ) : (
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
            {active?.messages.map((m) => (
              m.role === "user"
                ? <UserMessage key={m.id} content={m.content} />
                : <NexaMessage key={m.id} content={m.content} actions={m.actions} onRunAction={runAction} />
            ))}
            {thinking && <TypingIndicator />}
          </div>
        )}

        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          <MessageComposer onSend={send} disabled={thinking} />
        </div>
      </div>

      {/* Desktop context panel */}
      <div className="hidden w-72 shrink-0 xl:block" style={{ borderLeft: "1px solid var(--border)" }}>
        <div className="no-scrollbar h-full overflow-y-auto"><ContextPanel context={context} /></div>
      </div>

      {/* Mobile/tablet context drawer */}
      {contextOpen && (
        <div className="fixed inset-0 z-40 flex justify-end xl:hidden" onClick={() => setContextOpen(false)}>
          <div className="flex-1 bg-black/20" />
          <div className="h-full w-72 overflow-y-auto" style={{ background: "var(--bg)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4"><span className="text-[13px] font-semibold">Context</span><button onClick={() => setContextOpen(false)} aria-label="Close" className="t-fast rounded-full p-1.5 hover:bg-[var(--surface-muted)]"><X size={16} /></button></div>
            <ContextPanel context={context} />
          </div>
        </div>
      )}
    </div>
  );
}




