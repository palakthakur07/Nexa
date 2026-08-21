import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Users } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useConnections } from "../context/ConnectionsContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function ConnectionsList() {
  const { connections } = useConnections();
  const { mentors } = useCatalog();
  const navigate = useNavigate();
  if (connections.length === 0) {
    return (
      <div className="nexa-card flex flex-col items-center gap-2 rounded-[var(--radius-lg)] p-8 text-center">
        <Users size={20} style={{ color: "var(--text-tertiary)" }} />
        <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>No connections yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {connections.map((c) => {
        const woman = c.womanId ? mentors.find((w) => w.id === c.womanId) : null;
        return (
          <div key={c.id} className="nexa-card flex items-center justify-between gap-3 rounded-[var(--radius-lg)] p-4">
            <div className="flex items-center gap-3">
              <Avatar initials={c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")} size={40} />
              <div>
                <div className="text-[14px] font-semibold">{c.name}</div>
                <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{c.reason} · Connected {timeAgo(c.since)}</div>
              </div>
            </div>
            {woman && <button onClick={() => navigate(`/network/${woman.id}`)} className="t-fast text-[12.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>View profile</button>}
          </div>
        );
      })}
    </div>
  );
}

function RequestsList() {
  const { sent, received, acceptReceived, declineReceived } = useConnections();
  const { mentors } = useCatalog();
  const [tab, setTab] = useState("received");
  const list = tab === "received" ? received : sent;

  return (
    <div>
      <div className="mb-4 flex gap-6" style={{ borderBottom: "1px solid var(--border)" }}>
        {["received", "sent"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className="t-fast pb-2.5 text-[13.5px] font-semibold capitalize" style={{ color: tab === t ? "var(--accent-strong)" : "var(--text-tertiary)", borderBottom: tab === t ? "2px solid var(--accent-strong)" : "2px solid transparent" }}>{t}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Nothing here yet.</p>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="nexa-card rounded-[var(--radius-lg)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13.5px] font-semibold">{tab === "received" ? r.personName : mentors.find((w) => w.id === r.womanId)?.name || "Mentor"}</div>
                  <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{r.topic} · {r.requestType}</div>
                  <p className="mt-1.5 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>{r.message}</p>
                </div>
                <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize" style={{ background: r.status === "accepted" ? "var(--success-soft)" : r.status === "declined" ? "var(--surface-muted)" : "var(--warning-soft)", color: r.status === "accepted" ? "var(--success)" : r.status === "declined" ? "var(--text-tertiary)" : "var(--warning)" }}>{r.status}</span>
              </div>
              {tab === "received" && r.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button variant="primary" size="sm" icon={Check} onClick={() => acceptReceived(r.id)}>Accept</Button>
                  <Button variant="ghost" size="sm" icon={X} onClick={() => declineReceived(r.id)}>Decline</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Connections() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <NavBackLink />
      <Reveal><h1 className="font-display mt-4 text-[2.1rem]">My connections & requests</h1><p className="mt-1 text-[14px]" style={{ color: "var(--text-secondary)" }}>Requests you send to mentors appear here, along with anyone you connect with.</p></Reveal>

      <Reveal delay={60} className="mt-8"><h2 className="font-display text-[1.3rem]">Connections</h2><div className="mt-4"><ConnectionsList /></div></Reveal>
      <Reveal delay={100} className="mt-10"><h2 className="font-display text-[1.3rem]">Requests</h2><div className="mt-4"><RequestsList /></div></Reveal>
    </div>
  );
}

function NavBackLink() {
  const navigate = useNavigate();
  return <button onClick={() => navigate("/network")} className="t-fast inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}><ArrowLeft size={14} /> Back to Network</button>;
}






