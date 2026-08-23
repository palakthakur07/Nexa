import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import {
  fetchOrganizationByOwner, createOrganization, updateOrganization,
  fetchOrganizationOpportunities, submitOrganizationOpportunity,
  updateOpportunity as updateOpportunityRow,
} from "../lib/dataService.js";

// Mirrors ProfileContext's shape: one org row per authenticated owner (or
// null if they haven't created one). Real orgs only — there is no offline
// demo fallback here, since "submit a real opportunity" has no honest local
// stand-in the way browsing sample data does.
const OrganizationContext = createContext(null);

export function OrganizationProvider({ children }) {
  const { user, configured } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!configured || !user) { setOrganization(null); setOpportunities([]); setLoaded(true); return; }
    const org = await fetchOrganizationByOwner(user.id);
    setOrganization(org);
    if (org) setOpportunities(await fetchOrganizationOpportunities(org.id));
    else setOpportunities([]);
    setLoaded(true);
  }, [user, configured]);

  useEffect(() => { refresh(); }, [refresh]);

  const createOrg = useCallback(async (fields) => {
    if (!user) throw new Error("Must be signed in to create an organization.");
    const org = await createOrganization(user.id, fields);
    setOrganization(org);
    return org;
  }, [user]);

  const saveOrgProfile = useCallback(async (fields) => {
    if (!organization) throw new Error("No organization to update.");
    await updateOrganization(organization.id, fields);
    await refresh();
  }, [organization, refresh]);

  // Create a new listing under this organization — always lands as
  // PENDING_REVIEW server-side (see protect_opportunity_insert trigger),
  // regardless of what's passed here.
  const submitOpportunity = useCallback(async (fields) => {
    if (!organization) throw new Error("No organization to submit under.");
    await submitOrganizationOpportunity({ ...fields, organizationId: organization.id });
    await refresh();
  }, [organization, refresh]);

  const updateOwnOpportunity = useCallback(async (id, fields) => {
    if (!organization) throw new Error("No organization.");
    // Force verificationStatus off the payload the org can't self-publish
    // client-side anyway (trigger enforces it), but keep the org from even
    // trying, so the UI's optimistic state doesn't lie.
    const { verificationStatus, ...rest } = fields;
    await updateOpportunityRow({ id, organizationId: organization.id, ...rest });
    await refresh();
  }, [organization, refresh]);

  const value = useMemo(() => ({
    organization, opportunities, loaded,
    isVerified: organization?.verificationStatus === "VERIFIED",
    createOrg, saveOrgProfile, submitOpportunity, updateOwnOpportunity, refresh,
  }), [organization, opportunities, loaded, createOrg, saveOrgProfile, submitOpportunity, updateOwnOpportunity, refresh]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error("useOrganization must be used inside <OrganizationProvider>");
  return ctx;
}
