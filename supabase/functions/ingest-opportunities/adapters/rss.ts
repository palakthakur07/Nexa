// Generic RSS/Atom adapter.
//
// Why RSS and not a scraper: an RSS/Atom feed is content a publisher
// explicitly built for syndication — pulling it isn't "scraping" in the
// robots.txt/ToS sense the way parsing arbitrary HTML would be. This is the
// one ingestion method that's safe to ship generically; a WEB (HTML) adapter
// would need to be written per-source, respecting that source's specific
// robots.txt and terms, which is a decision you make per source, not
// something this scaffold does for you.
//
// This adapter does NOT know what a "deadline" or "funding amount" is for
// any given feed — most RSS feeds don't carry structured opportunity data at
// all. It extracts only what RSS/Atom actually standardizes (title, link,
// description/summary, pubDate) and leaves everything else null. If you want
// deadlines/funding extracted from the description text, that's the "AI
// extraction" step mentioned in the brief — see extractWithAI() below, which
// is deliberately left unimplemented: wiring it up means picking a provider
// and accepting that AI is interpreting text, never inventing facts the feed
// didn't contain.

import Parser from "https://esm.sh/rss-parser@3.13.0";
import type { Adapter, NormalizedOpportunity, SourceRow } from "./types.ts";

const parser = new Parser();

function stripHtml(html: string | undefined): string | null {
  if (!html) return null;
  return html.replace(/<[^>]+>/g, "").trim() || null;
}

// Placeholder — intentionally not implemented. See file header. Wiring this
// up requires a provider decision (same nexa-chat OPENAI_API_KEY, or a
// separate one) and a strict prompt that refuses to output a field the
// source text doesn't support. Until then, deadline/funding/eligibility stay
// null for RSS-sourced drafts, and an admin fills them in during review.
async function extractWithAI(_text: string): Promise<Partial<NormalizedOpportunity>> {
  return {};
}

export const rssAdapter: Adapter = {
  async fetch(source: SourceRow): Promise<NormalizedOpportunity[]> {
    if (!source.source_url) throw new Error(`Source "${source.name}" has no source_url configured`);

    const feed = await parser.parseURL(source.source_url);
    const drafts: NormalizedOpportunity[] = [];

    for (const item of feed.items || []) {
      const link = item.link?.trim();
      if (!item.title || !link) continue; // no title or no link = nothing usable

      drafts.push({
        title: item.title.trim(),
        organization: feed.title || null,
        type: null,
        description: stripHtml(item.contentSnippet || item.content || item.summary),
        location: null,
        remote: false,
        application_url: link,
        deadline: null, // RSS doesn't standardize a deadline field
        funding_type: null,
        funding_amount: null,
        categories: item.categories || [],
        eligibility: [],
        benefits: [],
        source_name: feed.title || source.name,
        source_url: link,
      });
    }

    return drafts;
  },
};
