import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, X, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { fetchSources, createSource, updateSource, deleteSource, fetchIngestionLog } from "../lib/dataService.js";
import Button from "../components/ui/Button.jsx";

const SOURCE_TYPES = ["RSS", "API", "DATASET", "WEB", "MANUAL", "USER_SUBMISSION", "ORGANIZATION"];
const EMPTY = { name: "", website: "", sourceUrl: "", sourceType: "RSS", method: "", trustLevel: "MEDIUM", enabled: false, refreshFrequency: "daily" };

function HealthDot({ source }) {
  if (!source.lastCheckedAt) return <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: "var(--text-tertiary)" }}><MinusCircle size={13} /> Never run</span>;
  if (source.lastError) return <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: "var(--danger, #b91c1c)" }}><XCircle size={13} /> Failing</span>;
  return <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: "var(--success)" }}><CheckCircle2 size={13} /> Healthy</span>;
}

function SourceForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial?.id) await updateSource(initial.id, form);
      else await createSource(form);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="nexa-card rounded-[var(--radius-lg)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[15px] font-semibold">{initial?.id ? "Edit source" : "Add source"}</div>
        <button type="button" onClick={onCancel}><X size={18} /></button>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Name *</div>
          <input required className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.name} onChange={set("name")} /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Website</div>
          <input className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.website} onChange={set("website")} placeholder="https://…" /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Feed / API / dataset URL</div>
          <input className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.sourceUrl} onChange={set("sourceUrl")} placeholder="https://example.gov/opportunities.rss" /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Type</div>
          <select className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.sourceType} onChange={set("sourceType")}>
            {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Trust level</div>
          <select className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.trustLevel} onChange={set("trustLevel")}>
            <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
          </select></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Refresh frequency</div>
          <input className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.refreshFrequency} onChange={set("refreshFrequency")} placeholder="daily" /></label>
        <label className="flex items-center gap-2 pt-6 text-[13px]"><input type="checkbox" checked={form.enabled} onChange={set("enabled")} /> Enabled (included in the next ingestion run)</label>
      </div>
      <div className="mt-3.5">
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Method notes</div>
          <textarea rows={2} className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.method} onChange={set("method")} placeholder="e.g. Public RSS feed, no auth required. Checked robots.txt on 2026-08-01 — allowed." /></label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      </div>
    </form>
  );
}

export default function AdminSources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [log, setLog] = useState([]);

  async function load() {
    setLoading(true);
    const [s, l] = await Promise.all([fetchSources(), fetchIngestionLog(null, 10)]);
    setSources(s);
    setLog(l);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Remove this source? Existing opportunities it ingested stay in the catalog.")) return;
    await deleteSource(id);
    await load();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-4 flex gap-4 text-[13px] font-semibold" style={{ color: "var(--accent-strong)" }}>
        <Link to="/admin/opportunities">Opportunities</Link>
        <Link to="/admin/organizations">Organizations</Link>
        <Link to="/admin/sources" className="underline">Sources</Link>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-display text-[24px]">Ingestion sources</h1>
        {editing === null && <Button variant="primary" icon={Plus} onClick={() => setEditing("new")}>Add source</Button>}
      </div>
      <p className="mb-6 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>
        Each enabled source is polled by the <code>ingest-opportunities</code> Edge Function on its refresh schedule. Ingested items always land as <strong>Pending review</strong> in the opportunities queue — nothing here auto-publishes. Deploying the function and wiring up a schedule is a one-time setup step; see README → "Opportunity Engine → Phase 2".
      </p>

      {editing === "new" && <div className="mb-6"><SourceForm onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} /></div>}
      {editing && editing !== "new" && <div className="mb-6"><SourceForm initial={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} /></div>}

      {loading ? (
        <div className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Loading…</div>
      ) : (
        <div className="space-y-2.5">
          {sources.map((s) => (
            <div key={s.id} className="nexa-card flex items-center justify-between gap-3 rounded-[var(--radius-md)] p-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[13.5px] font-semibold">{s.name}</div>
                  <span className="text-[11px] font-semibold uppercase" style={{ color: "var(--text-tertiary)" }}>{s.sourceType}</span>
                  {!s.enabled && <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>(disabled)</span>}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-[11.5px]" style={{ color: "var(--text-secondary)" }}>
                  <HealthDot source={s} />
                  <span>{s.opportunitiesFound} found lifetime</span>
                  {s.lastCheckedAt && <span>checked {new Date(s.lastCheckedAt).toLocaleString()}</span>}
                </div>
                {s.lastError && <div className="mt-0.5 text-[11px]" style={{ color: "var(--danger, #b91c1c)" }}>{s.lastError}</div>}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" onClick={() => setEditing(s)} className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: "var(--surface-muted)" }}>Edit</button>
                <button type="button" onClick={() => handleDelete(s.id)} aria-label="Delete" className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {sources.length === 0 && <div className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>No sources configured yet. Ingestion is fully opt-in — nothing runs until you add and enable a real source here.</div>}
        </div>
      )}

      {log.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-[1.2rem]">Recent ingestion runs</h2>
          <div className="mt-3 space-y-1.5">
            {log.map((l) => (
              <div key={l.id} className="nexa-card rounded-[var(--radius-md)] p-3 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                {new Date(l.started_at).toLocaleString()} · {l.status || "running"} · found {l.items_found} · created {l.items_created} · duplicates {l.items_duplicate} · rejected {l.items_rejected}
                {l.error_message && <div style={{ color: "var(--danger, #b91c1c)" }}>{l.error_message}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
