import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import MentorCard from "../components/network/MentorCard.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";

// Real mentor directory, backed by the `mentors` table (see
// migrations/003_mentor_network.sql) via CatalogContext — the same table
// MentorDetail, BecomeMentor, and ConnectionsContext use. Previously this
// page queried profiles.is_mentor from an abandoned schema branch that
// nothing else in the app wrote to, so it was always empty in practice.
export default function Network() {
  const navigate = useNavigate();
  const { mentors, loading } = useCatalog();
  const [search, setSearch] = useState("");
  const [selectedField, setSelectedField] = useState("All Fields");

  const fields = useMemo(
    () => ["All Fields", ...new Set(mentors.map((m) => m.industry).filter(Boolean))],
    [mentors]
  );

  const filteredMentors = useMemo(() => {
    const q = search.toLowerCase();
    return mentors.filter((m) => {
      const matchesSearch =
        !q ||
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.profession && m.profession.toLowerCase().includes(q)) ||
        (m.organization && m.organization.toLowerCase().includes(q)) ||
        (m.topics && m.topics.some((t) => t.toLowerCase().includes(q)));
      const matchesField = selectedField === "All Fields" || m.industry === selectedField;
      return matchesSearch && matchesField;
    });
  }, [mentors, search, selectedField]);

  return (
    <div className="min-h-screen px-6 py-14 md:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="nexa-panel relative overflow-hidden rounded-[var(--radius-xl)] p-8 md:p-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-soft)] bg-[var(--surface-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
              <Sparkles size={13} />
              <span>Your network, your guide</span>
            </div>
            <h1 className="font-display text-[2.2rem] leading-tight md:text-[2.7rem]">
              NEXA <span style={{ color: "var(--accent)" }}>Mentorship</span> Network
            </h1>
            <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Connect with verified leaders, gain guidance, or support others in your journey.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 md:absolute md:right-10 md:top-1/2 md:mt-0 md:-translate-y-1/2">
            <button onClick={() => navigate("/become-mentor")} className="nexa-btn-primary t-fast inline-flex items-center rounded-full px-5 py-3 text-[13px] font-semibold">
              Become a Mentor
            </button>
            <button onClick={() => navigate("/requests")} className="nexa-btn-secondary t-fast inline-flex items-center rounded-full px-5 py-3 text-[13px] font-semibold">
              My Requests
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search by field, topic, or mentor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="nexa-ai-input w-full rounded-full px-4 py-3 text-[13.5px] outline-none placeholder:text-[var(--text-tertiary)] sm:w-96"
          />
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="nexa-btn-secondary w-full cursor-pointer rounded-full px-4 py-3 text-[13.5px] outline-none sm:w-48"
          >
            {fields.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Loading mentors...</div>
        ) : filteredMentors.length === 0 ? (
          <div className="nexa-card rounded-[var(--radius-lg)] py-16 text-center text-[13.5px]" style={{ color: "var(--text-secondary)" }}>
            {mentors.length === 0
              ? "No mentors have registered yet — be the first to become a mentor."
              : "No mentors found matching your criteria."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
          </div>
        )}
      </div>
    </div>
  );
}
