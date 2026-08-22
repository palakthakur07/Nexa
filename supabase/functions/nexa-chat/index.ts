// Server-side proxy for NEXA's AI provider.
//
// This is the ONLY place the OpenAI API key exists. It is a server-side
// secret set via `supabase secrets set`, never a VITE_* env var, so it is
// never bundled into frontend JS.
//
// Deploy:
//   supabase functions deploy nexa-chat
//
// Configure secrets (run once, from your project root, logged in to the
// Supabase CLI and linked to your project):
//   supabase secrets set OPENAI_API_KEY=sk-...
//   # optional overrides, both have sane defaults below:
//   supabase secrets set NEXA_AI_BASE_URL=https://api.openai.com/v1/chat/completions
//   supabase secrets set NEXA_AI_MODEL=gpt-4o-mini
//
// SUPABASE_URL and SUPABASE_ANON_KEY are provided automatically to every
// Edge Function by the platform — you don't set those yourself.
//
// Auth: Supabase's function gateway verifies the caller's JWT before this
// code even runs (project default "Verify JWT" = on for new functions). We
// also re-check explicitly below — defense in depth, and it gives us the
// actual user id rather than just "some valid token was present."
//
// The model and provider URL are fixed server-side (not accepted from the
// request body) on purpose: letting a client pick the model would let
// anyone with a valid session request an arbitrary, possibly expensive,
// model on your account.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_BASE_URL = Deno.env.get("NEXA_AI_BASE_URL") || "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = Deno.env.get("NEXA_AI_MODEL") || "gpt-4o-mini";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// Conservative caps so a malformed or hostile request body can't blow up
// token usage or the request payload before it ever reaches OpenAI.
const MAX_MESSAGES = 40;
const MAX_CHARS_PER_MESSAGE = 6000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!OPENAI_API_KEY) {
    console.error("nexa-chat: OPENAI_API_KEY secret is not set");
    return json({ error: "AI provider is not configured on the server" }, 500);
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("nexa-chat: SUPABASE_URL/SUPABASE_ANON_KEY missing from function environment");
    return json({ error: "Server misconfiguration" }, 500);
  }

  // Explicit auth check — confirms *who* is calling, so we know this is an
  // authenticated NEXA user rather than just "a request with some token."
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "messages array is required" }, 400);
  }
  if (messages.length > MAX_MESSAGES) {
    return json({ error: "Too many messages" }, 400);
  }
  for (const m of messages as Array<{ role?: unknown; content?: unknown }>) {
    if (typeof m?.role !== "string" || typeof m?.content !== "string") {
      return json({ error: "Each message needs a role and content string" }, 400);
    }
    if (m.content.length > MAX_CHARS_PER_MESSAGE) {
      return json({ error: "A message is too long" }, 400);
    }
  }

  try {
    const upstream = await fetch(OPENAI_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: OPENAI_MODEL, messages, temperature: 0.5 }),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error("nexa-chat: upstream error", upstream.status, text);
      return json({ error: "AI provider error" }, 502);
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return json({ error: "AI provider returned no content" }, 502);

    return json({ content });
  } catch (err) {
    console.error("nexa-chat: request failed", err);
    return json({ error: "AI provider request failed" }, 502);
  }
});
