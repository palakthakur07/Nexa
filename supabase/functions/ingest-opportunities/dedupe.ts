// A stable fingerprint for "is this the same opportunity we already have."
// Deliberately simple and deterministic — no fuzzy matching, so it can't
// silently merge two different opportunities. Two rows collide only when
// their application URL matches (normalized) OR their (org, title) pair
// matches exactly after normalization. Titles/descriptions are NOT hashed
// together, since near-duplicate wording from two different sources should
// still be reviewable side by side rather than silently merged.

function normalize(s: string | null | undefined): string {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeUrl(u: string | null | undefined): string {
  if (!u) return "";
  try {
    const url = new URL(u);
    url.hash = "";
    // Strip common tracking params so ?utm_source=... doesn't defeat dedup.
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"].forEach((p) => url.searchParams.delete(p));
    return `${url.origin}${url.pathname}${url.search}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return normalize(u);
  }
}

export function dedupeKey(input: { applicationUrl?: string | null; organization?: string | null; title: string }): string {
  const url = normalizeUrl(input.applicationUrl);
  if (url) return `url:${url}`;
  return `org-title:${normalize(input.organization)}::${normalize(input.title)}`;
}
