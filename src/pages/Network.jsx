import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Users, Sparkles } from "lucide-react";
import NetworkHero from "../components/network/NetworkHero.jsx";
import NetworkSearch from "../components/network/NetworkSearch.jsx";
import NetworkFilters, { emptyNetworkFilters, activeNetworkFilterCount } from "../components/network/NetworkFilters.jsx";
import WomanCard from "../components/network/WomanCard.jsx";
import CommunitySuggestion from "../components/network/CommunitySuggestion.jsx";
import GiveBackCard from "../components/network/GiveBackCard.jsx";
import Button from "../components/ui/Button.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { calculateWomanMatchScore } from "../lib/womanMatching.js";

function matchesFilters(woman, filters) {
  if (filters.experience.length && !woman.experience.some((e) => filters.experience.includes(e))) return false;
  if (filters.journey.length && !woman.journeyTags.some((j) => filters.journey.includes(j))) return false;
  if (filters.helpType.length && !woman.willingToHelpWith.some((h) => filters.helpType.includes(h))) return false;
  if (filters.languages.length && !woman.languages.some((l) => filters.languages.includes(l))) return false;
  if (filters.locations.length) {
    const ok = filters.locations.some((l) => (l === "Remote" ? woman.location === "Remote" : woman.location === l || (l === "International" && woman.location === "International")));
    if (!ok) return false;
  }
  return true;
}
function matchesSearch(woman, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return [woman.name, woman.headline, ...woman.experience, ...woman.skills, ...woman.journey, ...woman.canHelpWith].join(" ").toLowerCase().includes(q);
}

export default function Network() {
  const { profile } = useProfile();
  const { mentors } = useCatalog();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(emptyNetworkFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const scored = useMemo(() => mentors.map((w) => ({ woman: w, match: calculateWomanMatchScore(profile, w) })).sort((a, b) => b.match - a.match), [profile, mentors]);
  const filtered = useMemo(() => scored.filter(({ woman }) => matchesFilters(woman, filters) && matchesSearch(woman, query)), [scored, filters, query]);

  const topMatches = scored.slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 md:px-10">
      <Reveal><NetworkHero profile={profile} matchCount={scored.filter((s) => s.match >= 70).length} /></Reveal>

      <Reveal delay={60} className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[1.5rem]">Strongest matches for you</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/nexa", { state: { entryContext: { type: "network" } } })} className="t-fast inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--accent-strong)" }}><Sparkles size={13} /> Ask NEXA who I should talk to</button>
          <button onClick={() => navigate("/network/connections")} className="t-fast text-[13px] font-semibold" style={{ color: "var(--accent-strong)" }}>My connections & requests</button>
        </div>
      </Reveal>
      <Reveal delay={100} className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topMatches.map(({ woman, match }) => <WomanCard key={woman.id} woman={woman} match={match} />)}
      </Reveal>

      <Reveal delay={140}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-[1.5rem]">Browse the network</h2>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-full sm:w-64"><NetworkSearch value={query} onChange={setQuery} /></div>
            <button onClick={() => setFiltersOpen(true)} className="nexa-btn-secondary t-fast inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold">
              <SlidersHorizontal size={14} /> Filters{activeNetworkFilterCount(filters) > 0 && ` (${activeNetworkFilterCount(filters)})`}
            </button>
          </div>
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <Reveal>
          <div className="nexa-card flex flex-col items-center gap-3 rounded-[var(--radius-lg)] p-10 text-center">
            <Users size={22} style={{ color: "var(--text-tertiary)" }} />
            <div className="text-[15px] font-semibold">Your network is still taking shape.</div>
            <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Try widening your interests or adding more things you can help with.</p>
            <Button variant="secondary" onClick={() => { setFilters(emptyNetworkFilters()); setQuery(""); }}>Clear filters</Button>
          </div>
        </Reveal>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ woman, match }) => <WomanCard key={woman.id} woman={woman} match={match} />)}
        </div>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Reveal><CommunitySuggestion /></Reveal>
        <Reveal delay={60}><GiveBackCard /></Reveal>
      </div>

      <NetworkFilters open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} setFilters={setFilters} />
    </div>
  );
}


