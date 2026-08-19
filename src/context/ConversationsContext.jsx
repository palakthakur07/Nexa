import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const STORAGE_KEY = "nexa_conversations_v1";

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
  } catch {
    return [];
  }
}

const ConversationsContext = createContext(null);

export function ConversationsProvider({ children }) {
  const [conversations, setConversations] = useState(loadStored);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      // storage unavailable — session-only fallback
    }
  }, [conversations]);

  const createConversation = useCallback((entryContext = null) => {
    const id = `conv-${Date.now()}`;
    const now = new Date().toISOString();
    const conv = { id, title: "New conversation", messages: [], entryContext, createdAt: now, updatedAt: now };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const addMessage = useCallback((conversationId, message) => {
    setConversations((prev) => prev.map((c) => {
      if (c.id !== conversationId) return c;
      const messages = [...c.messages, message];
      const firstUser = messages.find((m) => m.role === "user");
      const title = c.title === "New conversation" && firstUser ? deriveTitle(firstUser.content) : c.title;
      return { ...c, messages, title, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const deleteConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

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
