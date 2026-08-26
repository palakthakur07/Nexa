import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Shared shell for simple static pages (About, Privacy, Terms) — public,
// no auth required, matches the landing page's visual language.
export default function StaticPage({ eyebrow, title, updated, children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen py-16 px-6 md:px-10" style={{ background: "var(--surface-muted)" }}>
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="t-fast mb-8 inline-flex items-center gap-1.5 text-[13.5px] font-semibold"
          style={{ color: "var(--accent-strong)" }}
        >
          <ArrowLeft size={15} /> Back to NEXA
        </button>

        <div className="nexa-panel rounded-3xl p-8 md:p-10">
          {eyebrow && (
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
              {eyebrow}
            </div>
          )}
          <h1 className="font-display mt-2 text-[2rem]">{title}</h1>
          {updated && (
            <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>Last updated {updated}</p>
          )}
          <div
            className="mt-6 space-y-5 text-[14.5px] leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}