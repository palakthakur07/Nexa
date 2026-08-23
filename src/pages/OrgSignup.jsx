import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "../context/OrganizationContext.jsx";
import Button from "../components/ui/Button.jsx";

const ORG_TYPES = ["Nonprofit", "University / Institution", "Government", "Company", "Foundation", "Other"];

export default function OrgSignup() {
  const navigate = useNavigate();
  const { organization, loaded, createOrg } = useOrganization();
  const [form, setForm] = useState({ name: "", website: "", orgType: "", description: "", contactName: "", contactEmail: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loaded && organization) {
    navigate("/org/dashboard", { replace: true });
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createOrg(form);
      navigate("/org/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-[1.9rem]">Create your organization account</h1>
      <p className="mt-2 text-[14px]" style={{ color: "var(--text-secondary)" }}>
        This lets your organization submit and manage its own opportunity listings. New organizations start <strong>unverified</strong> —
        every submission you make goes through NEXA's review queue until an admin verifies your organization.
      </p>

      <form onSubmit={submit} className="nexa-card mt-8 space-y-3.5 rounded-[var(--radius-lg)] p-6">
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Organization name *</div>
          <input required className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.name} onChange={set("name")} /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Official website *</div>
          <input required type="url" className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.website} onChange={set("website")} placeholder="https://…" /></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Organization type</div>
          <select className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.orgType} onChange={set("orgType")}>
            <option value="">Select…</option>
            {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select></label>
        <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Description</div>
          <textarea rows={3} className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.description} onChange={set("description")} /></label>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Contact name</div>
            <input className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.contactName} onChange={set("contactName")} /></label>
          <label className="block"><div className="mb-1 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>Contact email *</div>
            <input required type="email" className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--border)" }} value={form.contactEmail} onChange={set("contactEmail")} /></label>
        </div>
        {error && <div className="text-[13px]" style={{ color: "var(--danger, #b91c1c)" }}>{error}</div>}
        <div className="pt-2"><Button variant="primary" type="submit" disabled={saving}>{saving ? "Creating…" : "Create organization account"}</Button></div>
      </form>
    </div>
  );
}
