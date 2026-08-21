import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import { fetchConversations } from "../lib/dataService.js";

const STORAGE_KEY = "nexa_conversations_v1";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `conv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function deriveTitle(firstUserMessage) {
  if (!firstUserMessage) return "New conversation";
  const words = firstUserMessage.trim().split(/\s+/).slice(0, 6).join(" ");
  const title = words.length < firstUserMessage.trim().length ? `${words}…` : words;
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function loadStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

const ConversationsContext = createContext(null);

export function ConversationsProvider({ children }) {
  const { user, configured } = useAuth();
  const [conversations, setConversations] = useState(configured ? [] : loadStored);
  const [activeId, setActiveId] = useState(null);

  // Load this user's conversations from Supabase when signed in.
  useEffect(() => {
    if (!configured) return;
    if (!user) { setConversations([]); setActiveId(null); return; }
    let alive = true;
    fetchConversations(user.id).then((rows) => { if (alive) setConversations(rows); });
    return () => { alive = false; };
  }, [user, configured]);

  // Persist to localStorage only in offline mode.
  useEffect(() => {
    if (configured) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)); } catch { /* ignore */ }
  }, [conversations, configured]);

  // Returns the new conversation id synchronously; persistence happens in the
  // background so callers (Nexa.jsx) can keep their existing flow.
  const createConversation = useCallback((entryContext = null) => {
    const id = newId();
    const now = new Date().toISOString();
    const conv = { id, title: "New conversation", messages: [], entryContext, createdAt: now, updatedAt: now };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
    if (isSupabaseConfigured() && user) {
      supabase.from("conversations").insert({ id, user_id: user.id, entry_context: entryContext })
        .then(({ error }) => { if (error) console.error("createConversation:", error.message); });
    }
    return id;
  }, [user]);

  const addMessage = useCallback((conversationId, message) => {
    const msgId = message.id && message.id.length > 20 ? message.id : newId();
    let nextTitle = null;
    setConversations((prev) => prev.map((c) => {
      if (c.id !== conversationId) return c;
      const messages = [...c.messages, { ...message, id: msgId }];
      const firstUser = messages.find((m) => m.role === "user");
      const title = c.title === "New conversation" && firstUser ? deriveTitle(firstUser.content) : c.title;
      if (title !== c.title) nextTitle = title;
      return { ...c, messages, title, updatedAt: new Date().toISOString() };
    }));
    if (isSupabaseConfigured() && user) {
      supabase.from("messages").insert({
        id: msgId, conversation_id: conversationId, user_id: user.id,
        role: message.role, content: message.content, actions: message.actions || [],
      }).then(({ error }) => { if (error) console.error("addMessage:", error.message); });
      const patch = { updated_at: new Date().toISOString() };
      if (nextTitle) patch.title = nextTitle;
      supabase.from("conversations").update(patch).eq("id", conversationId)
        .then(({ error }) => { if (error) console.error("updateConversation:", error.message); });
    }
  }, [user]);

  const deleteConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
    if (isSupabaseConfigured() && user) {
      supabase.from("conversations").delete().eq("id", id)
        .then(({ error }) => { if (error) console.error("deleteConversation:", error.message); });
    }
  }, [user]);

  const value = useMemo(() => ({
    conversations, activeId, setActiveId, createConversation, addMessage, deleteConversation,
  }), [conversations, activeId, createConversation, addMessage, deleteConversation]);

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error("useConversations must be used inside <ConversationsProvider>");
  return ctx;
}

