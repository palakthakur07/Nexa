// Data-access layer. Every read/write of real (non-auth) data goes through
// here so components and contexts never call `supabase` directly. Catalog
// data (opportunities, mentors) is fetched from Supabase and cached in
// module memory for the session.
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { rowToOpportunity, rowToWoman, rowToCommunity } from "./mappers.js";

let _opportunities = null;
let _mentors = null;
let _communities = null;

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

export async function fetchMentors() {
  if (_mentors) return _mentors;
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("mentors").select("*");
  if (error) { console.error("fetchMentors:", error.message); return []; }
  _mentors = data.map(rowToWoman);
  return _mentors;
}

export async function fetchMentor(id) {
  const all = await fetchMentors();
  return all.find((m) => m.id === id) || null;
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

// ---------- connection requests ----------
export async function fetchRequests(userId) {
  if (!isSupabaseConfigured() || !userId) return [];
  const { data, error } = await supabase.from("connection_requests").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) { console.error("fetchRequests:", error.message); return []; }
  return data;
}

export async function createRequest(userId, mentorId, { topic, requestType, message }) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase.from("connection_requests")
    .insert({ user_id: userId, mentor_id: mentorId, topic, request_type: requestType, message })
    .select().single();
  if (error) { console.error("createRequest:", error.message); return null; }
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

