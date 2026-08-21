import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchOpportunities, fetchMentors } from "../lib/dataService.js";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import { OPPORTUNITY_TYPES } from "../data/opportunities.js";

// Single source of truth for the public catalogs (opportunities + mentors).
// When Supabase is configured, data is real and comes from the database.
// When it isn't, we fall back to the bundled sample arrays so the app is
// still explorable offline — the seed script pushes those very rows into
// Supabase, so the two never disagree.
const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [opportunities, setOpportunities] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      if (isSupabaseConfigured()) {
        const [opps, ms] = await Promise.all([fetchOpportunities(), fetchMentors()]);
        if (!alive) return;
        setOpportunities(opps);
        setMentors(ms);
      } else {
        // Offline fallback — dynamic import so these arrays aren't in the
        // critical bundle path when a real backend is configured.
        const [{ OPPORTUNITIES }, { WOMEN }] = await Promise.all([
          import("../data/opportunities.js"),
          import("../data/women.js"),
        ]);
        if (!alive) return;
        setOpportunities(OPPORTUNITIES);
        setMentors(WOMEN);
      }
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, []);

  const value = useMemo(
    () => ({ opportunities, mentors, loading, opportunityTypes: OPPORTUNITY_TYPES }),
    [opportunities, mentors, loading]
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}

