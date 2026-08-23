import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Plus, X, Pencil } from "lucide-react";
import { useOrganization } from "../context/OrganizationContext.jsx";
import { OrganizationVerificationBadge, OpportunityVerificationBadge } from "../components/ui/VerificationBadge.jsx";
import Button from "../components/ui/Button.jsx";

function toCsv(arr) { return (arr || []).join(", "); }
function fromCsv(str) { return str.split(",").map((s) => s.trim()).filter(Boolean); }

const EMPTY = {
  title: "", type: "Scholarship", description: "", location: "", remote: false,
  categories: "", goals: "", careerStages: "", skills: "", fundingType: "", fundingAmount: "",
  deadline: "", eligibility: "", benefits: "", applicationUrl: "",
};

function toFormState(o) {
  return {
    id: o.id, title: o.title || "", type: o.type || "", description: o.description || "",
    location: o.location || "", remote: !!o.remote, categories: toCsv(o.categories), goals: toCsv(o.goals),
    careerStages: toCsv(o.careerStages), skills: toCsv(o.skills), fundingType: o.funding?.type || "",
    fundingAmount: o.funding?.amount ?? "", deadline: o.deadline || "", eligibility: toCsv(o.eligibility),
    benefits: toCsv(o.benefits), applicationUrl: o.applicationUrl || "",
  };
}

function OrgOpportunityForm({ initial, organization, onCancel, onSaved }) {
  const { submitOpportunity, updateOwnOpportunity } = useOrganization();
  const [form, setForm] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!initial?.id;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title, organization: organization.name, type: form.type, description: form.description,
        location: form.location, remote: form.remote, categories: fromCsv(form.categories), goals: fromCsv(form.goals),
        careerStages: fromCsv(form.careerStages), skills: fromCsv(form.skills),
        funding: { type: form.fundingType, amount: form.fundingAmount === "" ? null : Number(form.fundingAmount) },
        deadline: form.deadline, eligibility: fromCsv(form.eligibility), benefits: fromCsv(form.benefits),
        applicationUrl: form.applicationUrl, source: organization.name, sourceType: "ORGANIZATION",
      };
      if (isEdit) await updateOwnOpportunity(form.id, payload);
      else await submitOpportunity({ ...payload, id: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36) });
      onSaved();
    } catch (err) {
      setError(err.message || "Something went wrong saving this.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="nexa-card rounded-[var(--radius-lg)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[15px] font-semibold">{isEdit ? "Edit listing" : "New listing"}</div>
        <button type="button" onClick={onCancel}><X size={18} /></button>
      </div>
      <p className="mb-3.5 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>
        {organization.verificationStatus === "VERIFIED"
          ? "Your organization is verified, but every new/edited listing still goes to review before it's published — this keeps NEXA's catalog accurate even for trusted organizations."
          : "Your organization isn't verified yet. This listing will be queued for admin review before it can appear publicly."}
      </p>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Title *</div>
          <input required className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.title} onChange={set("title")} /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Type</div>
          <input className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.type} onChange={set("type")} placeholder="Scholarship / Grant / Internship…" /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Location</div>
          <input className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.location} onChange={set("location")} /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Deadline *</div>
          <input required type="date" className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.deadline} onChange={set("deadline")} /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Application URL *</div>
          <input required type="url" className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.applicationUrl} onChange={set("applicationUrl")} placeholder="https://…" /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Funding type</div>
          <input className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.fundingType} onChange={set("fundingType")} /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Funding amount (USD)</div>
          <input type="number" className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.fundingAmount} onChange={set("fundingAmount")} /></label>
        <label className="flex items-center gap-2 pt-6 text-[13px]"><input type="checkbox" checked={form.remote} onChange={set("remote")} /> Remote</label>
      </div>
      <div className="mt-3.5"><label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Description</div>
        <textarea rows={3} className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.description} onChange={set("description")} /></label></div>
      <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Categories (comma-separated)</div>
          <input className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.categories} onChange={set("categories")} /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Eligibility (comma-separated)</div>
          <input className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.eligibility} onChange={set("eligibility")} /></label>
      </div>
      {error && <div className="mt-3 text-[13px]" style={{ color: "var(--danger, #b91c1c)" }}>{error}</div>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" type="submit" disabled={saving}>{saving ? "Submitting…" : isEdit ? "Save & resubmit for review" : "Submit for review"}</Button>
      </div>
    </form>
  );
}

export default function OrgDashboard() {
  const { organization, opportunities, loaded } = useOrganization();
  const [editing, setEditing] = useState(null);

  if (loaded && !organization) return <Navigate to="/org/signup" replace />;
  if (!loaded || !organization) {
    return <div className="flex min-h-[50vh] items-center justify-center"><div className="anim-spin-slow h-8 w-8 rounded-full" style={{ border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[24px]">{organization.name}</h1>
            <OrganizationVerificationBadge status={organization.verificationStatus} />
          </div>
          <p className="mt-1 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{opportunities.length} listing{opportunities.length === 1 ? "" : "s"} submitted.</p>
        </div>
        {editing === null && <Button variant="primary" icon={Plus} onClick={() => setEditing("new")}>New listing</Button>}
      </div>

      {editing === "new" && <div className="mb-6"><OrgOpportunityForm organization={organization} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} /></div>}
      {editing && editing !== "new" && <div className="mb-6"><OrgOpportunityForm organization={organization} initial={toFormState(editing)} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} /></div>}

      <div className="space-y-2.5">
        {opportunities.map((o) => (
          <div key={o.id} className="nexa-card flex items-center justify-between gap-3 rounded-[var(--radius-md)] p-3.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-[13.5px] font-semibold">{o.title}</div>
                <OpportunityVerificationBadge status={o.verificationStatus} />
              </div>
              <div className="truncate text-[11.5px]" style={{ color: "var(--text-secondary)" }}>{o.type} · deadline {o.deadline}</div>
              {o.rejectionReason && <div className="mt-0.5 text-[11px]" style={{ color: "var(--danger, #b91c1c)" }}>Rejected: {o.rejectionReason}</div>}
            </div>
            <button type="button" onClick={() => setEditing(o)} aria-label="Edit" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}><Pencil size={14} /></button>
          </div>
        ))}
        {opportunities.length === 0 && <div className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>No listings yet — add your first one above. It'll be reviewed before it appears in Discover.</div>}
      </div>
    </div>
  );
}
