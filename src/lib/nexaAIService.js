// The only file that knows whether NEXA is talking to a real AI provider
// or running in demo mode. UI code calls askNexa() and never touches a
// provider directly — swapping providers later means changing this file
// only.
//
// SECURITY: a private API key must never ship in frontend code. The
// VITE_NEXA_AI_API_KEY path below exists for local experimentation only —
// enabling it bundles the key into client-side JS, which is visible to
// anyone. For a real deployment, replace callRealProvider() with a fetch
// to your own backend/proxy that holds the key server-side. Because no key
// is configured in this project by default, demo mode is what actually
// ships and is the only fully-tested path here.
import { generateMockResponse } from "./nexaMock.js";
import { buildSystemPrompt } from "./nexaSystemPrompt.js";

const API_KEY = typeof import.meta !== "undefined" ? import.meta.env?.VITE_NEXA_AI_API_KEY : undefined;
const BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_NEXA_AI_BASE_URL) || "https://api.openai.com/v1/chat/completions";
const MODEL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_NEXA_AI_MODEL) || "gpt-4o-mini";

export function isDemoMode() {
  return !API_KEY;
}

async function callRealProvider(message, context, history) {
  const messages = [
    { role: "system", content: buildSystemPrompt(context) },
    ...history.map((h) => ({ role: h.role === "nexa" ? "assistant" : "user", content: h.content })),
    { role: "user", content: message },
  ];
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.5 }),
  });
  if (!res.ok) throw new Error(`NEXA provider error: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("NEXA provider returned no content");
  // Real-provider replies are plain text for now — actions stay driven by
  // the deterministic layer until a structured-output contract is added.
  return { content, actions: [] };
}

// askNexa: builds the prompt, sends context, receives a response, and
// always falls back to demo mode on any failure rather than surfacing a
// raw error to the user.
export async function askNexa(message, context, history = []) {
  const isFirstMessage = history.length === 0;
  if (isDemoMode()) {
    return generateMockResponse(message, context, isFirstMessage);
  }
  try {
    return await callRealProvider(message, context, history);
  } catch (err) {
    console.error("NEXA provider call failed, falling back to demo mode:", err);
    return generateMockResponse(message, context, isFirstMessage);
  }
}
