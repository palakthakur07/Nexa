import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { fetchAllOrganizations, setOrganizationVerification } from "../lib/dataService.js";
import { OrganizationVerificationBadge } from "../components/ui/VerificationBadge.jsx";
import Button from "../components/ui/Button.jsx";

const TABS = [
  { key: "all", label: "All" },
  { key: "PENDING_VERIFICATION", label: "Pending" },
  { key: "VERIFIED", label: "Verified" },
  { key: "SUSPENDED", label: "Suspended" },
  { key: "UNVERIFIED", label: "Unverified" },
];

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setOrgs(await fetchAllOrganizations());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    setBusyId(id);
    try {
      await setOrganizationVerification(id, status);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const filtered = tab === "all" ? orgs : orgs.filter((o) => o.verificationStatus === tab);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-4 flex gap-4 text-[13px] font-semibold" style={{ color: "var(--accent-strong)" }}>
        <Link to="/admin/opportunities">Opportunities</Link>
        <Link to="/admin/organizations" className="underline">Organizations</Link>
        <Link to="/admin/sources">Sources</Link>
      </div>
      <h1 className="font-display text-[24px]">Organizations</h1>
      <p className="mt-1 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>
        Verifying an organization lets it publish opportunities without review. Unverified organizations can still submit — every submission still goes through the opportunities review queue.
      </p>

      <div className="mb-5 mt-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
            style={tab === t.key ? { background: "var(--accent)", color: "var(--text-on-accent)" } : { background: "var(--surface-muted)", color: "var(--text-secondary)" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Loading…</div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((o) => (
            <div key={o.id} className="nexa-card rounded-[var(--radius-md)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[14px] font-semibold">{o.name}</div>
                    <OrganizationVerificationBadge status={o.verificationStatus} />
                  </div>
                  <div className="mt-0.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>{o.orgType || "Type not specified"} · {o.contactEmail || "no contact email on file"}</div>
                  {o.website && <a href={o.website} target="_blank" rel="noreferrer" className="text-[12px] underline" style={{ color: "var(--accent-strong)" }}>{o.website}</a>}
                  {o.description && <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>{o.description}</p>}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {o.verificationStatus !== "VERIFIED" && (
                    <Button size="sm" variant="primary" icon={ShieldCheck} onClick={() => setStatus(o.id, "VERIFIED")} disabled={busyId === o.id}>Verify</Button>
                  )}
                  {o.verificationStatus === "UNVERIFIED" && (
                    <Button size="sm" variant="secondary" icon={Clock} onClick={() => setStatus(o.id, "PENDING_VERIFICATION")} disabled={busyId === o.id}>Mark pending</Button>
                  )}
                  {o.verificationStatus !== "SUSPENDED" && (
                    <Button size="sm" variant="ghost" icon={ShieldAlert} onClick={() => setStatus(o.id, "SUSPENDED")} disabled={busyId === o.id}>Suspend</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>No organizations in this view.</div>}
        </div>
      )}
    </div>
  );
}
