import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchOpportunities, fetchMentors, fetchCommunities, invalidateOpportunitiesCache } from "../lib/dataService.js";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import { OPPORTUNITY_TYPES } from "../data/opportunities.js";

// Single source of truth for the public catalogs (opportunities, mentors,
// communities). When Supabase is configured, data is real and comes from
// the database. When it isn't, we fall back to the bundled sample arrays
// so the app is still explorable offline — the seed script pushes those
// very rows into Supabase, so the two never disagree.
const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [opportunities, setOpportunities] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      if (isSupabaseConfigured()) {
        const [opps, ms, cs] = await Promise.all([fetchOpportunities(), fetchMentors(), fetchCommunities()]);
        if (!alive) return;
        setOpportunities(opps);
        setMentors(ms);
        setCommunities(cs);
      } else {
        // Offline fallback — dynamic import so these arrays aren't in the
        // critical bundle path when a real backend is configured.
        const [{ OPPORTUNITIES }, { WOMEN }, { COMMUNITIES }] = await Promise.all([
          import("../data/opportunities.js"),
          import("../data/women.js"),
          import("../data/communities.js"),
        ]);
        if (!alive) return;
        setOpportunities(OPPORTUNITIES);
        setMentors(WOMEN);
        setCommunities(COMMUNITIES);
      }
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, []);

  const value = useMemo(
    () => ({
      // `opportunities` is the PUBLIC-safe list: PUBLISHED only. Everything
      // outside /admin and /org should read from this, never from the raw
      // RLS-scoped fetch, since a signed-in admin/org session's raw fetch
      // includes their own drafts/pending rows.
      opportunities: opportunities.filter((o) => !o.verificationStatus || o.verificationStatus === "PUBLISHED" || o.verified),
      // `allOpportunities` is the raw RLS-scoped list (admin sees every
      // status; a regular user gets the same PUBLISHED-only rows either
      // way since RLS already restricts it). Used by /admin/opportunities.
      allOpportunities: opportunities,
      mentors, communities, loading, opportunityTypes: OPPORTUNITY_TYPES,
      // Admin writes go through dataService directly (see AdminOpportunities.jsx)
      // and then call this so the rest of the app reflects the change without
      // a full reload. Cheap no-op when Supabase isn't configured.
      refreshOpportunities: async () => {
        if (!isSupabaseConfigured()) return;
        invalidateOpportunitiesCache();
        const opps = await fetchOpportunities();
        setOpportunities(opps);
      },
    }),
    [opportunities, mentors, communities, loading]
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}

