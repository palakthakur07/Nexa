// Data-access layer. Every read/write of real (non-auth) data goes through
// here so components and contexts never call `supabase` directly. Catalog
// data (opportunities, mentors) is fetched from Supabase and cached in
// module memory for the session.
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import {
  rowToOpportunity, rowToMentor, mentorToRow, rowToCommunity,
  rowToOrganization, organizationToRow,
  rowToSource, sourceToRow,
  rowToNotification,
  rowToRoadmap, roadmapToRow,
} from "./mappers.js";

let _opportunities = null;
let _mentors = null;
let _communities = null;

// fetchOpportunities() returns only what RLS lets the current session see:
// PUBLISHED listings for everyone, plus (for a signed-in org owner or admin)
// their own non-published drafts. That's intentional — callers that need
// "the public catalog only" should filter on verificationStatus === "PUBLISHED"
// client-side too, since a signed-in admin/org viewing /discover would
// otherwise see their own drafts mixed in.
export async function fetchOpportunities() {
  if (_opportunities) return _opportunities;
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("opportunities").select("*").order("deadline", { ascending: true });
  if (error) { console.error("fetchOpportunities:", error.message); return []; }
  _opportunities = data.map(rowToOpportunity);
  return _opportunities;
}

export async function fetchOpportunity(id) {
  const all = await fetchOpportunities();
  return all.find((o) => o.id === id) || null;
}

export function invalidateOpportunitiesCache() {
  _opportunities = null;
}

// ---------- admin catalog writes (RLS restricts these to is_admin rows) ----------
export function opportunityToRow(o) {
  const row = {
    id: o.id, title: o.title, organization: o.organization, type: o.type,
    description: o.description, location: o.location, remote: !!o.remote,
    categories: o.categories || [], goals: o.goals || [], career_stages: o.careerStages || [],
    skills: o.skills || [], funding: o.funding || { type: "", amount: null },
    deadline: o.deadline, eligibility: o.eligibility || [], benefits: o.benefits || [],
    application_url: o.applicationUrl || "#", source: o.source || "", verified: !!o.verified,
  };
  // Provenance/workflow fields are only sent when present on the object, so
  // callers that don't know about them (older code paths) don't accidentally
  // null them out on every save.
  if (o.organizationId !== undefined) row.organization_id = o.organizationId;
  if (o.sourceType !== undefined) row.source_type = o.sourceType;
  if (o.sourceName !== undefined) row.source_name = o.sourceName;
  if (o.sourceUrl !== undefined) row.source_url = o.sourceUrl;
  if (o.verificationStatus !== undefined) row.verification_status = o.verificationStatus;
  return row;
}

// Admin-only create (RLS: opportunities_write_admin). Admin-authored listings
// are published immediately, matching the existing curated-catalog workflow.
export async function createOpportunity(o) {
  const payload = opportunityToRow(o);
  if (payload.verification_status === undefined) payload.verification_status = "PUBLISHED";
  const { error } = await supabase.from("opportunities").insert(payload);
  if (error) throw error;
  _opportunities = null; // force next fetch to hit the DB
}

export async function updateOpportunity(o) {
  const { error } = await supabase.from("opportunities").update(opportunityToRow(o)).eq("id", o.id);
  if (error) throw error;
  _opportunities = null;
}

export async function deleteOpportunity(id) {
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) throw error;
  _opportunities = null;
}

// Admin verification actions. The DB trigger (protect_opportunity_verification)
// is the real enforcement — this just calls update() with intent; a non-admin
// session hitting these will have VERIFIED/PUBLISHED silently downgraded to
// PENDING_REVIEW by the trigger, so there's no separate "am I admin" check
// needed client-side (defense stays server-side, per the security requirement).
export async function setOpportunityVerification(id, verificationStatus, rejectionReason = null) {
  const { error } = await supabase
    .from("opportunities")
    .update({ verification_status: verificationStatus, rejection_reason: rejectionReason })
    .eq("id", id);
  if (error) throw error;
  _opportunities = null;
}

export async function fetchPendingReview() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("opportunities").select("*").eq("verification_status", "PENDING_REVIEW").order("created_at", { ascending: true });
  if (error) { console.error("fetchPendingReview:", error.message); return []; }
  return data.map(rowToOpportunity);
}

// ---------- organizations ----------
export async function fetchOrganizationByOwner(ownerId) {
  if (!isSupabaseConfigured() || !ownerId) return null;
  const { data, error } = await supabase.from("organizations").select("*").eq("owner_id", ownerId).maybeSingle();
  if (error) { console.error("fetchOrganizationByOwner:", error.message); return null; }
  return data ? rowToOrganization(data) : null;
}

export async function fetchAllOrganizations() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("organizations").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchAllOrganizations:", error.message); return []; }
  return data.map(rowToOrganization);
}

export async function createOrganization(userId, org) {
  const { data, error } = await supabase
    .from("organizations")
    .insert({ ...organizationToRow(org), owner_id: userId })
    .select().single();
  if (error) throw error;
  return rowToOrganization(data);
}

export async function updateOrganization(id, org) {
  const { error } = await supabase.from("organizations").update(organizationToRow(org)).eq("id", id);
  if (error) throw error;
}

// Admin-only in practice (RLS + protect_org_verification trigger silently
// reverts this for non-admins).
export async function setOrganizationVerification(id, verificationStatus) {
  const { error } = await supabase.from("organizations").update({ verification_status: verificationStatus }).eq("id", id);
  if (error) throw error;
}

// ---------- organization's own opportunities ----------
export async function fetchOrganizationOpportunities(organizationId) {
  if (!isSupabaseConfigured() || !organizationId) return [];
  const { data, error } = await supabase.from("opportunities").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false });
  if (error) { console.error("fetchOrganizationOpportunities:", error.message); return []; }
  return data.map(rowToOpportunity);
}

// Org owners insert through the same `opportunities` table as admin — RLS
// (opportunities_insert_org_owner) restricts them to their own
// organization_id, and the protect_opportunity_insert trigger forces
// verification_status to PENDING_REVIEW no matter what's sent here.
export async function submitOrganizationOpportunity(o) {
  const payload = opportunityToRow(o);
  const { error } = await supabase.from("opportunities").insert(payload);
  if (error) throw error;
  _opportunities = null;
}

// ---------- source registry (Phase 2, admin-only) ----------
export async function fetchSources() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("opportunity_sources").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchSources:", error.message); return []; }
  return data.map(rowToSource);
}

export async function createSource(s) {
  const { error } = await supabase.from("opportunity_sources").insert(sourceToRow(s));
  if (error) throw error;
}

export async function updateSource(id, s) {
  const { error } = await supabase.from("opportunity_sources").update(sourceToRow(s)).eq("id", id);
  if (error) throw error;
}

export async function deleteSource(id) {
  const { error } = await supabase.from("opportunity_sources").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchIngestionLog(sourceId, limit = 20) {
  if (!isSupabaseConfigured()) return [];
  let q = supabase.from("opportunity_ingestion_log").select("*").order("started_at", { ascending: false }).limit(limit);
  if (sourceId) q = q.eq("source_id", sourceId);
  const { data, error } = await q;
  if (error) { console.error("fetchIngestionLog:", error.message); return []; }
  return data;
}

// ---------- notifications ----------
export async function fetchNotifications(userId) {
  if (!isSupabaseConfigured() || !userId) return [];
  const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  if (error) { console.error("fetchNotifications:", error.message); return []; }
  return data.map(rowToNotification);
}

export async function markNotificationRead(id) {
  if (!isSupabaseConfigured()) return;
  await supabase.from("notifications").update({ read: true }).eq("id", id);
}

export async function fetchNotificationPreferences(userId) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).maybeSingle();
  if (error) { console.error("fetchNotificationPreferences:", error.message); return null; }
  return data;
}

export async function updateNotificationPreferences(userId, prefs) {
  if (!isSupabaseConfigured() || !userId) return;
  await supabase.from("notification_preferences").upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() });
}

export async function fetchMentors() {
  if (_mentors) return _mentors;
  if (!isSupabaseConfigured()) return [];
  // RLS restricts this to discoverable=true rows (or your own, or admin) —
  // no client-side filtering needed to keep non-consenting people out.
  const { data, error } = await supabase.from("mentors").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchMentors:", error.message); return []; }
  _mentors = data.map(rowToMentor);
  return _mentors;
}

export async function fetchMentor(id) {
  const all = await fetchMentors();
  const cached = all.find((m) => m.id === id);
  if (cached) return cached;
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("mentors").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return rowToMentor(data);
}

export async function fetchMyMentorProfile(userId) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase.from("mentors").select("*").eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return rowToMentor(data);
}

export async function createMentorProfile(userId, mentor) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase.from("mentors").insert({ user_id: userId, ...mentorToRow(mentor) }).select().single();
  if (error) throw error;
  _mentors = null;
  return rowToMentor(data);
}

export async function updateMentorProfile(mentorId, mentor) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("mentors").update(mentorToRow(mentor)).eq("id", mentorId).select().single();
  if (error) throw error;
  _mentors = null;
  return rowToMentor(data);
}

export async function deleteMentorProfile(mentorId) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("mentors").delete().eq("id", mentorId);
  if (error) throw error;
  _mentors = null;
}

export async function fetchCommunities() {
  if (_communities) return _communities;
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("communities").select("*").order("name", { ascending: true });
  if (error) { console.error("fetchCommunities:", error.message); return []; }
  _communities = data.map(rowToCommunity);
  return _communities;
}

// ---------- saved opportunities ----------
export async function fetchSaved(userId) {
  if (!isSupabaseConfigured() || !userId) return {};
  const { data, error } = await supabase.from("saved_opportunities").select("*").eq("user_id", userId);
  if (error) { console.error("fetchSaved:", error.message); return {}; }
  const map = {};
  for (const r of data) map[r.opportunity_id] = { status: r.status, savedAt: r.saved_at };
  return map;
}

export async function saveOpportunity(userId, opportunityId, status = "Interested") {
  if (!isSupabaseConfigured() || !userId) return;
  await supabase.from("saved_opportunities").upsert({ user_id: userId, opportunity_id: opportunityId, status });
}

export async function unsaveOpportunity(userId, opportunityId) {
  if (!isSupabaseConfigured() || !userId) return;
  await supabase.from("saved_opportunities").delete().eq("user_id", userId).eq("opportunity_id", opportunityId);
}

export async function setSavedStatus(userId, opportunityId, status) {
  if (!isSupabaseConfigured() || !userId) return;
  await supabase.from("saved_opportunities").update({ status }).eq("user_id", userId).eq("opportunity_id", opportunityId);
}

// ---------- connection requests (real — see migrations/003_mentor_network.sql) ----------
// Requests the signed-in user has SENT, as a member seeking guidance.
export async function fetchSentRequests(userId) {
  if (!isSupabaseConfigured() || !userId) return [];
  const { data, error } = await supabase.from("connection_requests").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) { console.error("fetchSentRequests:", error.message); return []; }
  return data;
}

// Requests directed at the mentor profile the signed-in user owns.
export async function fetchReceivedRequests(mentorId) {
  if (!isSupabaseConfigured() || !mentorId) return [];
  const { data, error } = await supabase.from("connection_requests").select("*").eq("mentor_id", mentorId).order("created_at", { ascending: false });
  if (error) { console.error("fetchReceivedRequests:", error.message); return []; }
  return data;
}

export async function createRequest(userId, mentorId, { topic, requestType, message }) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase.from("connection_requests")
    .insert({ user_id: userId, mentor_id: mentorId, topic, request_type: requestType, message })
    .select().single();
  // The trigger (rate limit / self-request / block / duplicate) raises a
  // real Postgres exception, which surfaces here as error.message — thrown
  // so the UI can show the actual reason instead of failing silently.
  if (error) throw error;
  return data;
}

export async function cancelRequest(requestId) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("connection_requests").update({ status: "cancelled" }).eq("id", requestId);
  if (error) throw error;
}

export async function respondToRequest(requestId, accept) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("connection_requests").update({ status: accept ? "accepted" : "declined" }).eq("id", requestId);
  if (error) throw error;
}

// ---------- connection messages (real — only exist once accepted) ----------
export async function fetchConnectionMessages(connectionRequestId) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("connection_messages").select("*").eq("connection_request_id", connectionRequestId).order("created_at", { ascending: true });
  if (error) { console.error("fetchConnectionMessages:", error.message); return []; }
  return data;
}

export async function sendConnectionMessage(connectionRequestId, senderId, body) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("connection_messages")
    .insert({ connection_request_id: connectionRequestId, sender_id: senderId, body })
    .select().single();
  if (error) throw error;
  return data;
}

// ---------- ratings (real — only from an accepted, completed interaction) ----------
export async function fetchMentorRatings(mentorId) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("mentor_ratings").select("*").eq("mentor_id", mentorId).order("created_at", { ascending: false });
  if (error) { console.error("fetchMentorRatings:", error.message); return []; }
  return data;
}

// Bulk fetch for directory/list views — one query instead of N, grouped
// client-side into { [mentorId]: { avg, count } }.
export async function fetchRatingsSummary() {
  if (!isSupabaseConfigured()) return {};
  const { data, error } = await supabase.from("mentor_ratings").select("mentor_id, rating");
  if (error) { console.error("fetchRatingsSummary:", error.message); return {}; }
  const grouped = {};
  for (const r of data) {
    if (!grouped[r.mentor_id]) grouped[r.mentor_id] = { sum: 0, count: 0 };
    grouped[r.mentor_id].sum += r.rating;
    grouped[r.mentor_id].count += 1;
  }
  const summary = {};
  for (const [id, { sum, count }] of Object.entries(grouped)) summary[id] = { avg: sum / count, count };
  return summary;
}

export async function submitRating(connectionRequestId, mentorId, ratedBy, rating, feedback) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("mentor_ratings")
    .insert({ connection_request_id: connectionRequestId, mentor_id: mentorId, rated_by: ratedBy, rating, feedback })
    .select().single();
  if (error) throw error;
  return data;
}

// Bulk name lookup for a set of user ids — used to label "received"
// connection requests with the requester's display name without a
// separate round trip per row.
export async function fetchProfileNamesByIds(userIds) {
  if (!isSupabaseConfigured() || !userIds || userIds.length === 0) return {};
  const unique = [...new Set(userIds)];
  const { data, error } = await supabase.from("profiles").select("id, name").in("id", unique);
  if (error) { console.error("fetchProfileNamesByIds:", error.message); return {}; }
  const map = {};
  for (const row of data) map[row.id] = row.name || "NEXA member";
  return map;
}

// ---------- block + report (real safety architecture) ----------
export async function blockUser(blockerId, blockedId) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("blocks").insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) throw error;
}

export async function unblockUser(blockerId, blockedId) {
  if (!isSupabaseConfigured()) return;
  await supabase.from("blocks").delete().eq("blocker_id", blockerId).eq("blocked_id", blockedId);
}

export async function submitReport(reporterId, reportedUserId, reason, details, connectionRequestId = null) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("reports")
    .insert({ reporter_id: reporterId, reported_user_id: reportedUserId, reason, details, connection_request_id: connectionRequestId })
    .select().single();
  if (error) throw error;
  return data;
}

// ---------- conversations + messages ----------
export async function fetchConversations(userId) {
  if (!isSupabaseConfigured() || !userId) return [];
  const { data, error } = await supabase
    .from("conversations")
    .select("*, messages(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) { console.error("fetchConversations:", error.message); return []; }
  return data.map((c) => ({
    id: c.id,
    title: c.title,
    entryContext: c.entry_context,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    messages: (c.messages || [])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((m) => ({ id: m.id, role: m.role, content: m.content, actions: m.actions || [] })),
  }));
}

export async function createConversation(userId, entryContext = null) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase.from("conversations")
    .insert({ user_id: userId, entry_context: entryContext }).select().single();
  if (error) { console.error("createConversation:", error.message); return null; }
  return data;
}

export async function insertMessage(userId, conversationId, message) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase.from("messages")
    .insert({ user_id: userId, conversation_id: conversationId, role: message.role, content: message.content, actions: message.actions || [] })
    .select().single();
  if (error) { console.error("insertMessage:", error.message); return null; }
  return data;
}

export async function updateConversationTitle(conversationId, title) {
  if (!isSupabaseConfigured()) return;
  await supabase.from("conversations").update({ title, updated_at: new Date().toISOString() }).eq("id", conversationId);
}

export async function deleteConversationRow(conversationId) {
  if (!isSupabaseConfigured()) return;
  await supabase.from("conversations").delete().eq("id", conversationId);
}

// ---------- roadmap (per user, RLS-scoped — see 006_roadmap.sql) ----------
// Returns null when the user has no roadmap yet (not an error) — that's the
// signal for the empty state, not a failed fetch.
export async function fetchRoadmap(userId) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase.from("roadmaps").select("*").eq("user_id", userId).maybeSingle();
  if (error) { console.error("fetchRoadmap:", error.message); return null; }
  return rowToRoadmap(data);
}

// Upsert on user_id — one roadmap row per user. Used both for first
// generation and for saving step-completion / regeneration.
export async function saveRoadmap(userId, roadmap) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase
    .from("roadmaps")
    .upsert(roadmapToRow(userId, roadmap), { onConflict: "user_id" })
    .select()
    .single();
  if (error) { console.error("saveRoadmap:", error.message); throw error; }
  return rowToRoadmap(data);
}

