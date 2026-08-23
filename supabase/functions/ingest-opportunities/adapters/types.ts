// Shared types for the ingestion pipeline. An "adapter" turns one source's
// native format into zero or more NormalizedOpportunity drafts. Adapters
// never invent values — anything the source doesn't provide is left null,
// per the product rule "if something is unknown, store it as unknown."

export interface SourceRow {
  id: string;
  name: string;
  website: string | null;
  source_url: string | null;
  source_type: string; // API | RSS | DATASET | WEB | MANUAL | USER_SUBMISSION | ORGANIZATION
  method: string | null;
  trust_level: string;
}

// Mirrors the subset of the `opportunities` table an adapter is responsible
// for filling in. Everything else (id, verification_status, submitted_by,
// timestamps) is set by the pipeline itself, not the adapter.
export interface NormalizedOpportunity {
  title: string;
  organization: string | null;
  type: string | null;
  description: string | null;
  location: string | null;
  remote: boolean;
  application_url: string;          // required — no draft without somewhere to apply
  deadline: string | null;          // "YYYY-MM-DD" or null if not stated
  funding_type: string | null;
  funding_amount: string | null;
  categories: string[];
  eligibility: string[];
  benefits: string[];
  source_name: string;
  source_url: string;               // the specific item URL/permalink, not just the feed
}

export interface Adapter {
  // Returns normalized drafts for one source. Throws on fetch/parse failure
  // so the pipeline can log it against opportunity_sources.last_error.
  fetch(source: SourceRow): Promise<NormalizedOpportunity[]>;
}
