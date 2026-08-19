import { X, SlidersHorizontal } from "lucide-react";
import Chip from "../ui/Chip.jsx";
import Button from "../ui/Button.jsx";
import { OPPORTUNITY_TYPES } from "../../data/opportunities.js";
import { CAREER_STAGES, INTERESTS } from "../../data/onboardingOptions.js";

export const LOCATIONS = ["India", "International", "Remote"];
export const FUNDING_LEVELS = ["Fully funded", "Partially funded", "Paid", "Unpaid", "No funding"];
export const FOCUS_AREAS = [...INTERESTS.filter((i) => i !== "Other"), "Women in Tech"];
export const DEADLINE_BUCKETS = [
  { key: "this-week", label: "This week" },
  { key: "this-month", label: "This month" },
  { key: "next-3-months", label: "Next 3 months" },
  { key: "later", label: "Later" },
];

export function emptyFilters() {
  return { types: [], careerStages: [], locations: [], funding: [], focus: [], deadline: null };
}

export function activeFilterCount(filters) {
  return filters.types.length + filters.careerStages.length + filters.locations.length + filters.funding.length + filters.focus.length + (filters.deadline ? 1 : 0);
}

function FilterGroup({ title, options, selected, onToggle }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const key = typeof o === "string" ? o : o.key;
          const label = typeof o === "string" ? o : o.label;
          return <Chip key={key} selected={selected.includes(key)} onClick={() => onToggle(key)}>{label}</Chip>;
        })}
      </div>
    </div>
  );
}

export default function OpportunityFilters({ open, onClose, filters, setFilters }) {
  const toggleIn = (field, key) => setFilters((f) => ({ ...f, [field]: f[field].includes(key) ? f[field].filter((v) => v !== key) : [...f[field], key] }));
  const setDeadline = (key) => setFilters((f) => ({ ...f, deadline: f.deadline === key ? null : key }));
  const clear = () => setFilters(emptyFilters());

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
      <div className="anim-drawer nexa-panel h-full w-full max-w-sm overflow-y-auto p-6" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[15px] font-semibold"><SlidersHorizontal size={16} /> Filters</div>
          <button onClick={onClose} aria-label="Close filters" className="t-fast rounded-full p-1.5 hover:bg-[var(--surface-muted)]"><X size={18} /></button>
        </div>

        <div className="mt-6 space-y-6">
          <FilterGroup title="Opportunity type" options={OPPORTUNITY_TYPES} selected={filters.types} onToggle={(k) => toggleIn("types", k)} />
          <FilterGroup title="Career stage" options={CAREER_STAGES} selected={filters.careerStages} onToggle={(k) => toggleIn("careerStages", k)} />
          <FilterGroup title="Location" options={LOCATIONS} selected={filters.locations} onToggle={(k) => toggleIn("locations", k)} />
          <FilterGroup title="Funding" options={FUNDING_LEVELS} selected={filters.funding} onToggle={(k) => toggleIn("funding", k)} />
          <FilterGroup title="Focus" options={FOCUS_AREAS} selected={filters.focus} onToggle={(k) => toggleIn("focus", k)} />
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Deadline</div>
            <div className="flex flex-wrap gap-2">
              {DEADLINE_BUCKETS.map((d) => <Chip key={d.key} selected={filters.deadline === d.key} onClick={() => setDeadline(d.key)}>{d.label}</Chip>)}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Button variant="primary" onClick={onClose}>Show results</Button>
          <Button variant="ghost" onClick={clear}>Clear filters</Button>
        </div>
      </div>
    </div>
  );
}
