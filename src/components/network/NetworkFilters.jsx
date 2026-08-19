import { X, SlidersHorizontal } from "lucide-react";
import Chip from "../ui/Chip.jsx";
import Button from "../ui/Button.jsx";
import { EXPERIENCE_AREAS, JOURNEY_TAGS, HELP_TYPES, LANGUAGES, NETWORK_LOCATIONS } from "../../data/networkOptions.js";

export function emptyNetworkFilters() { return { experience: [], journey: [], helpType: [], locations: [], languages: [] }; }
export function activeNetworkFilterCount(f) { return f.experience.length + f.journey.length + f.helpType.length + f.locations.length + f.languages.length; }

function FilterGroup({ title, options, selected, onToggle }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{title}</div>
      <div className="flex flex-wrap gap-2">{options.map((o) => <Chip key={o} selected={selected.includes(o)} onClick={() => onToggle(o)}>{o}</Chip>)}</div>
    </div>
  );
}

export default function NetworkFilters({ open, onClose, filters, setFilters }) {
  const toggleIn = (field, key) => setFilters((f) => ({ ...f, [field]: f[field].includes(key) ? f[field].filter((v) => v !== key) : [...f[field], key] }));
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
      <div className="anim-drawer nexa-panel h-full w-full max-w-sm overflow-y-auto p-6" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[15px] font-semibold"><SlidersHorizontal size={16} /> Filters</div>
          <button onClick={onClose} aria-label="Close filters" className="t-fast rounded-full p-1.5 hover:bg-[var(--surface-muted)]"><X size={18} /></button>
        </div>
        <div className="mt-6 space-y-6">
          <FilterGroup title="Experience" options={EXPERIENCE_AREAS} selected={filters.experience} onToggle={(k) => toggleIn("experience", k)} />
          <FilterGroup title="Journey" options={JOURNEY_TAGS} selected={filters.journey} onToggle={(k) => toggleIn("journey", k)} />
          <FilterGroup title="Help type" options={HELP_TYPES} selected={filters.helpType} onToggle={(k) => toggleIn("helpType", k)} />
          <FilterGroup title="Location" options={NETWORK_LOCATIONS} selected={filters.locations} onToggle={(k) => toggleIn("locations", k)} />
          <FilterGroup title="Language" options={LANGUAGES} selected={filters.languages} onToggle={(k) => toggleIn("languages", k)} />
        </div>
        <div className="mt-8 flex items-center gap-3">
          <Button variant="primary" onClick={onClose}>Show results</Button>
          <Button variant="ghost" onClick={() => setFilters(emptyNetworkFilters())}>Clear filters</Button>
        </div>
      </div>
    </div>
  );
}
