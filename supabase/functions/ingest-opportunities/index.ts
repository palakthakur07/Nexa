// Phase 2 ingestion pipeline.
//
// Deploy:
//   supabase functions deploy ingest-opportunities --no-verify-jwt
//
// (--no-verify-jwt because this is meant to be called by a scheduled job,
// not a browser session — see the "Configure a schedule" note below. The
// function does its own auth check instead, see requireAuthorized() below.)
//
// Configure secrets (same project, run once):
//   supabase secrets set INGEST_SHARED_SECRET=<a random string you generate>
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically to
// every Edge Function — you don't set those yourself. This function uses the
// SERVICE ROLE key (not anon) because it needs to bypass RLS to insert on
// behalf of sources rather than a specific signed-in user; that's also why
// it's gated behind INGEST_SHARED_SECRET rather than a user JWT.
//
// Configure a schedule (you must do this — nothing runs automatically until
// you do):
//   Supabase Dashboard → Edge Functions → ingest-opportunities → Cron —
//   add a schedule (e.g. "0 6 * * *" for daily at 06:00 UTC), OR use
//   pg_cron + pg_net from the SQL editor to call this URL on a schedule.
//   Either way, the request needs `Authorization: Bearer <INGEST_SHARED_SECRET>`.
//
// What this does NOT do: pick real source URLs for you, guarantee a source's
// robots.txt/ToS allows fetching (check that yourself before enabling a
// source — see AdminSources' "method notes" field for recording that you
// did), or auto-publish anything. Every row this creates lands as
// PENDING_REVIEW; a human still reviews it in /admin/opportunities before it
// becomes visible to users.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { rssAdapter } from "./adapters/rss.ts";
import type { Adapter, NormalizedOpportunity, SourceRow } from "./adapters/types.ts";
import { dedupeKey } from "./dedupe.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INGEST_SHARED_SECRET = Deno.env.get("INGEST_SHARED_SECRET");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

// Adapter registry — add a new source_type here as you build more adapters.
// WEB (generic HTML scraping) is deliberately absent: a general-purpose
// scraper can't respect a specific source's robots.txt/ToS, so that has to
// be a per-source adapter you write once you've reviewed that source's
// terms, not something this scaffold ships by default.
const ADAPTERS: Record<string, Adapter> = {
  RSS: rssAdapter,
};

function requireAuthorized(req: Request): boolean {
  if (!INGEST_SHARED_SECRET) return false; // fail closed if not configured
  const auth = req.headers.get("Authorization") || "";
  return auth === `Bearer ${INGEST_SHARED_SECRET}`;
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

function validate(draft: NormalizedOpportunity): string | null {
  if (!draft.title || draft.title.trim().length < 3) return "title missing or too short";
  if (!draft.application_url) return "application_url missing";
  try { new URL(draft.application_url); } catch { return "application_url is not a valid URL"; }
  return null;
}

async function ingestSource(supabase: ReturnType<typeof createClient>, source: SourceRow) {
  const log = {
    source_id: source.id,
    started_at: new Date().toISOString(),
    items_found: 0, items_created: 0, items_updated: 0, items_duplicate: 0, items_rejected: 0,
    status: "SUCCESS" as string,
    error_message: null as string | null,
  };

  try {
    const adapter = ADAPTERS[source.source_type];
    if (!adapter) throw new Error(`No adapter implemented for source_type "${source.source_type}"`);

    const drafts = await adapter.fetch(source);
    log.items_found = drafts.length;

    for (const draft of drafts) {
      const problem = validate(draft);
      if (problem) { log.items_rejected += 1; continue; }

      const key = dedupeKey({ applicationUrl: draft.application_url, organization: draft.organization, title: draft.title });
      const { data: existing } = await supabase.from("opportunities").select("id").eq("dedupe_key", key).maybeSingle();

      if (existing) {
        // Refresh last_verified_at / description on the existing draft only
        // if it's still pending review — never touch a row a human already
        // published/rejected, so ingestion can't silently overwrite a
        // decision that was already made.
        const { data: existingRow } = await supabase.from("opportunities").select("verification_status").eq("id", existing.id).single();
        if (existingRow?.verification_status === "PENDING_REVIEW") {
          await supabase.from("opportunities").update({
            description: draft.description,
            last_verified_at: new Date().toISOString(),
          }).eq("id", existing.id);
          log.items_updated += 1;
        } else {
          log.items_duplicate += 1;
        }
        continue;
      }

      const id = `${slugify(draft.title)}-${key.slice(0, 8).replace(/[^a-z0-9]/gi, "")}`;
      const { error: insertError } = await supabase.from("opportunities").insert({
        id,
        title: draft.title,
        organization: draft.organization,
        type: draft.type,
        description: draft.description,
        location: draft.location,
        remote: draft.remote,
        categories: draft.categories,
        eligibility: draft.eligibility,
        benefits: draft.benefits,
        funding: { type: draft.funding_type, amount: draft.funding_amount },
        deadline: draft.deadline,
        application_url: draft.application_url,
        source: draft.source_name,
        source_type: source.source_type,
        source_name: draft.source_name,
        source_url: draft.source_url,
        dedupe_key: key,
        verification_status: "PENDING_REVIEW", // ingestion NEVER auto-publishes
        verified: false,
      });
      if (insertError) { log.items_rejected += 1; continue; }
      log.items_created += 1;
    }

    await supabase.from("opportunity_sources").update({
      last_checked_at: new Date().toISOString(),
      last_success_at: new Date().toISOString(),
      last_error: null,
      opportunities_found: (source as unknown as { opportunities_found?: number }).opportunities_found
        ? (source as unknown as { opportunities_found: number }).opportunities_found + log.items_created
        : log.items_created,
    }).eq("id", source.id);
  } catch (err) {
    log.status = "FAILURE";
    log.error_message = err instanceof Error ? err.message : String(err);
    await supabase.from("opportunity_sources").update({
      last_checked_at: new Date().toISOString(),
      last_error: log.error_message,
    }).eq("id", source.id);
  }

  await supabase.from("opportunity_ingestion_log").insert({ ...log, finished_at: new Date().toISOString() });
  return log;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!requireAuthorized(req)) return json({ error: "Unauthorized" }, 401);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json({ error: "Server misconfiguration" }, 500);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let sourceId: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    sourceId = body?.sourceId;
  } catch { /* no body is fine — run all enabled sources */ }

  let query = supabase.from("opportunity_sources").select("*").eq("enabled", true);
  if (sourceId) query = query.eq("id", sourceId);
  const { data: sources, error } = await query;
  if (error) return json({ error: error.message }, 500);
  if (!sources || sources.length === 0) return json({ ranSources: 0, results: [] });

  const results = [];
  for (const source of sources as SourceRow[]) {
    results.push({ source: source.name, ...(await ingestSource(supabase, source)) });
  }

  return json({ ranSources: results.length, results });
});
