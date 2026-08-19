import { useMemo, useState } from "react";
import { SlidersHorizontal, Compass } from "lucide-react";
import DiscoverHeader from "../components/discover/DiscoverHeader.jsx";
import FeaturedOpportunity from "../components/discover/FeaturedOpportunity.jsx";
import OpportunityCard from "../components/discover/OpportunityCard.jsx";
import OpportunitySearch from "../components/discover/OpportunitySearch.jsx";
import SortControl from "../components/discover/SortControl.jsx";
import OpportunityFilters, { emptyFilters, activeFilterCount } from "../components/discover/OpportunityFilters.jsx";
import Button from "../components/ui/Button.jsx";
import { Reveal } from "../lib/hooks.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { OPPORTUNITIES } from "../data/opportunities.js";
import { calculateMatchScore } from "../lib/matching.js";
import { deadlineBucket, daysLeft } from "../lib/deadline.js";

function matchesFilters(opp, filters) {
  if (filters.types.length && !filters.types.includes(opp.type)) return false;
  if (filters.careerStages.length && !opp.careerStages.some((c) => filters.careerStages.includes(c))) return false;
  if (filters.funding.length && !filters.funding.includes(opp.funding.type)) return false;
  if (filters.focus.length && !opp.categories.some((c) => filters.focus.includes(c))) return false;
  if (filters.locations.length) {
    const locOk = filters.locations.some((l) => (l === "Remote" ? opp.remote : opp.location === l));
    if (!locOk) return false;
  }
  if (filters.deadline && deadlineBucket(opp.deadline) !== filters.deadline) return false;
  return true;
}

function matchesSearch(opp, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const haystack = [opp.title, opp.organization, opp.description, ...opp.categories, ...opp.skills].join(" ").toLowerCase();
  return haystack.includes(q);
}

export default function Discover() {
  const { profile } = useProfile();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("best-match");

  const scored = useMemo(
    () => OPPORTUNITIES.map((o) => ({ opportunity: o, match: calculateMatchScore(profile, o) })),
    [profile]
  );

  const filtered = useMemo(
    () => scored.filter(({ opportunity }) => matchesFilters(opportunity, filters) && matchesSearch(opportunity, query)),
    [scored, filters, query]
  );

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sort === "best-match") list.sort((a, b) => b.match - a.match);
    else if (sort === "deadline") list.sort((a, b) => daysLeft(a.opportunity.deadline) - daysLeft(b.opportunity.deadline));
    else if (sort === "recent") list.sort((a, b) => OPPORTUNITIES.indexOf(b.opportunity) - OPPORTUNITIES.indexOf(a.opportunity));
    else if (sort === "funding") {
      const rank = { "Fully funded": 3, "Paid": 2, "Partially funded": 1, "Unpaid": 0, "No funding": 0 };
      list.sort((a, b) => (rank[b.opportunity.funding.type] ?? 0) - (rank[a.opportunity.funding.type] ?? 0));
    }
    return list;
  }, [filtered, sort]);

  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 md:px-10">
      <Reveal><DiscoverHeader profile={profile} /></Reveal>

      {featured && (
        <Reveal delay={80} className="mb-12">
          <FeaturedOpportunity opportunity={featured.opportunity} match={featured.match} profile={profile} />
        </Reveal>
      )}

      <Reveal delay={120}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-[1.5rem]">More opportunities for you</h2>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-full sm:w-64"><OpportunitySearch value={query} onChange={setQuery} /></div>
            <button onClick={() => setFiltersOpen(true)} className="nexa-btn-secondary t-fast inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold">
              <SlidersHorizontal size={14} /> Filters{activeFilterCount(filters) > 0 && ` (${activeFilterCount(filters)})`}
            </button>
            <SortControl value={sort} onChange={setSort} />
          </div>
        </div>
      </Reveal>

      {rest.length === 0 ? (
        <Reveal>
          <div className="nexa-card flex flex-col items-center gap-3 rounded-[var(--radius-lg)] p-10 text-center">
            <Compass size={22} style={{ color: "var(--text-tertiary)" }} />
            <div className="text-[15px] font-semibold">No opportunities found.</div>
            <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Try widening your filters or changing your search.</p>
            <Button variant="secondary" onClick={() => { setFilters(emptyFilters()); setQuery(""); }}>Clear filters</Button>
          </div>
        </Reveal>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map(({ opportunity, match }) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} match={match} />
          ))}
        </div>
      )}

      <OpportunityFilters open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} setFilters={setFilters} />
    </div>
  );
}
