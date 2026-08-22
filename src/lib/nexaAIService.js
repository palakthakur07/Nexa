// The only file that knows whether NEXA is talking to a real AI provider
// or running in demo mode. UI code calls askNexa() and never touches a
// provider or a network endpoint directly.
//
// PRODUCTION ARCHITECTURE: the frontend never holds a provider API key.
// Real requests go to the `nexa-chat` Supabase Edge Function
// (supabase/functions/nexa-chat/index.ts), which holds the OpenAI key as a
// server-side secret and forwards the request. The frontend sends only the
// user's own Supabase session token; the edge function verifies it before
// calling OpenAI, so the proxy can't be used by someone who isn't signed
// in, and the OpenAI key is never shipped in client JS.
//
// Demo mode (nexaMock.js) is used whenever Supabase isn't configured (no
// backend to call) or the user isn't signed in (askNexa falls back
// automatically — see the catch below, since callRealProvider throws if
// there's no session).
import { generateMockResponse } from "./nexaMock.js";
import { buildSystemPrompt } from "./nexaSystemPrompt.js";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const SUPABASE_URL = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SUPABASE_URL : undefined;
const PROXY_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_NEXA_AI_PROXY_URL) ||
  (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/nexa-chat` : undefined);

export function isDemoMode() {
  return !isSupabaseConfigured() || !PROXY_URL;
}

async function callRealProvider(message, context, history) {
  const { data: { session } = {} } = await supabase.auth.getSession();
  if (!session) throw new Error("NEXA proxy requires a signed-in session");

  const messages = [
    { role: "system", content: buildSystemPrompt(context) },
    ...history.map((h) => ({ role: h.role === "nexa" ? "assistant" : "user", content: h.content })),
    { role: "user", content: message },
  ];

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`NEXA proxy error: ${res.status} ${body}`);
  }
  const data = await res.json();
  if (!data.content) throw new Error("NEXA proxy returned no content");
  // Proxy replies are plain text for now — actions stay driven by the
  // deterministic layer until a structured-output contract is added.
  return { content: data.content, actions: [] };
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
