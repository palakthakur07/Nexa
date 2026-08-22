import { useState } from "react";
import { Plus, Trash2, Pencil, X, ExternalLink } from "lucide-react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { createOpportunity, updateOpportunity, deleteOpportunity } from "../lib/dataService.js";
import Button from "../components/ui/Button.jsx";

// Simple in-app catalog editor, gated by AdminRoute (profile.isAdmin).
// Array-shaped fields (categories, skills, etc.) are edited as comma-
// separated text rather than a multi-select — trades a little polish for
// a form that's easy to keep in sync with the schema.
const EMPTY = {
  id: "", title: "", organization: "", type: "Scholarship", description: "",
  location: "", remote: false, categories: "", goals: "", careerStages: "",
  skills: "", fundingType: "", fundingAmount: "", deadline: "", eligibility: "",
  benefits: "", applicationUrl: "", source: "", verified: false,
};

function toCsv(arr) { return (arr || []).join(", "); }
function fromCsv(str) { return str.split(",").map((s) => s.trim()).filter(Boolean); }

function opportunityToFormState(o) {
  return {
    id: o.id, title: o.title || "", organization: o.organization || "", type: o.type || "",
    description: o.description || "", location: o.location || "", remote: !!o.remote,
    categories: toCsv(o.categories), goals: toCsv(o.goals), careerStages: toCsv(o.careerStages),
    skills: toCsv(o.skills), fundingType: o.funding?.type || "", fundingAmount: o.funding?.amount ?? "",
    deadline: o.deadline || "", eligibility: toCsv(o.eligibility), benefits: toCsv(o.benefits),
    applicationUrl: o.applicationUrl || "", source: o.source || "", verified: !!o.verified,
  };
}

function formStateToOpportunity(f) {
  return {
    id: f.id || f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36),
    title: f.title, organization: f.organization, type: f.type, description: f.description,
    location: f.location, remote: f.remote, categories: fromCsv(f.categories), goals: fromCsv(f.goals),
    careerStages: fromCsv(f.careerStages), skills: fromCsv(f.skills),
    funding: { type: f.fundingType, amount: f.fundingAmount === "" ? null : Number(f.fundingAmount) },
    deadline: f.deadline, eligibility: fromCsv(f.eligibility), benefits: fromCsv(f.benefits),
    applicationUrl: f.applicationUrl, source: f.source, verified: f.verified,
  };
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>{label}</div>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]";
const inputStyle = { borderColor: "var(--border)", background: "var(--surface)" };

function OpportunityForm({ initial, onCancel, onSaved }) {
  const { refreshOpportunities } = useCatalog();
  const [form, setForm] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!initial?.id;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = formStateToOpportunity(form);
      if (isEdit) await updateOpportunity(payload);
      else await createOpportunity(payload);
      await refreshOpportunities();
      onSaved();
    } catch (err) {
      setError(err.message || "Something went wrong saving this.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="nexa-card rounded-[var(--radius-lg)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[15px] font-semibold">{isEdit ? "Edit opportunity" : "Add opportunity"}</div>
        <button type="button" onClick={onCancel} aria-label="Cancel"><X size={18} /></button>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Title *"><input required className={inputClass} style={inputStyle} value={form.title} onChange={set("title")} /></Field>
        <Field label="Organization"><input className={inputClass} style={inputStyle} value={form.organization} onChange={set("organization")} /></Field>
        <Field label="Type (Scholarship / Grant / Fellowship / Returnship)"><input className={inputClass} style={inputStyle} value={form.type} onChange={set("type")} /></Field>
        <Field label="Location"><input className={inputClass} style={inputStyle} value={form.location} onChange={set("location")} placeholder="e.g. International, Remote, Bengaluru" /></Field>
        <Field label="Deadline *"><input required type="date" className={inputClass} style={inputStyle} value={form.deadline} onChange={set("deadline")} /></Field>
        <Field label="Application URL *"><input required type="url" className={inputClass} style={inputStyle} value={form.applicationUrl} onChange={set("applicationUrl")} placeholder="https://…" /></Field>
        <Field label="Funding type"><input className={inputClass} style={inputStyle} value={form.fundingType} onChange={set("fundingType")} placeholder="Fully funded / Stipend / Grant" /></Field>
        <Field label="Funding amount (USD, optional)"><input type="number" className={inputClass} style={inputStyle} value={form.fundingAmount} onChange={set("fundingAmount")} /></Field>
        <Field label="Source (where you found it)"><input className={inputClass} style={inputStyle} value={form.source} onChange={set("source")} placeholder="e.g. aauw.org" /></Field>
        <div className="flex items-end gap-4 pb-2">
          <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={form.remote} onChange={set("remote")} /> Remote</label>
          <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={form.verified} onChange={set("verified")} /> Verified</label>
        </div>
      </div>

      <div className="mt-3.5">
        <Field label="Description"><textarea rows={3} className={inputClass} style={inputStyle} value={form.description} onChange={set("description")} /></Field>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Categories (comma-separated)"><input className={inputClass} style={inputStyle} value={form.categories} onChange={set("categories")} /></Field>
        <Field label="Goals this matches (comma-separated)"><input className={inputClass} style={inputStyle} value={form.goals} onChange={set("goals")} /></Field>
        <Field label="Career stages (comma-separated)"><input className={inputClass} style={inputStyle} value={form.careerStages} onChange={set("careerStages")} /></Field>
        <Field label="Skills (comma-separated)"><input className={inputClass} style={inputStyle} value={form.skills} onChange={set("skills")} /></Field>
        <Field label="Eligibility (comma-separated)"><input className={inputClass} style={inputStyle} value={form.eligibility} onChange={set("eligibility")} /></Field>
        <Field label="Benefits (comma-separated)"><input className={inputClass} style={inputStyle} value={form.benefits} onChange={set("benefits")} /></Field>
      </div>

      {error && <div className="mt-3 text-[13px]" style={{ color: "var(--danger, #b91c1c)" }}>{error}</div>}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Add opportunity"}</Button>
      </div>
    </form>
  );
}

export default function AdminOpportunities() {
  const { opportunities, refreshOpportunities } = useCatalog();
  const [editing, setEditing] = useState(null); // null | "new" | opportunity object
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(id) {
    if (!window.confirm("Remove this opportunity? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await deleteOpportunity(id);
      await refreshOpportunities();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[24px]">Opportunities catalog</h1>
          <p className="mt-1 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{opportunities.length} listings · closed ones drop off automatically once their deadline passes.</p>
        </div>
        {editing === null && <Button variant="primary" icon={Plus} onClick={() => setEditing("new")}>Add opportunity</Button>}
      </div>

      {editing === "new" && <div className="mb-6"><OpportunityForm onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} /></div>}
      {editing && editing !== "new" && <div className="mb-6"><OpportunityForm initial={opportunityToFormState(editing)} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} /></div>}

      <div className="space-y-2.5">
        {opportunities.map((o) => (
          <div key={o.id} className="nexa-card flex items-center justify-between gap-3 rounded-[var(--radius-md)] p-3.5">
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-semibold">{o.title}</div>
              <div className="truncate text-[11.5px]" style={{ color: "var(--text-secondary)" }}>
                {o.organization} · {o.type} · {o.deadline}
                {o.applicationUrl && o.applicationUrl !== "#" && (
                  <a href={o.applicationUrl} target="_blank" rel="noreferrer" className="ml-1.5 inline-flex items-center gap-0.5" style={{ color: "var(--accent-strong)" }}>
                    link <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button type="button" onClick={() => setEditing(o)} aria-label="Edit" className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}><Pencil size={14} /></button>
              <button type="button" onClick={() => handleDelete(o.id)} disabled={deletingId === o.id} aria-label="Delete" className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {opportunities.length === 0 && <div className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>No opportunities yet — add the first one above.</div>}
      </div>
    </div>
  );
}
