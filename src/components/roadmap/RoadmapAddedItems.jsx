import { Plus } from "lucide-react";

// Surfaces profile.customRoadmapItems — items added via the "Add to
// roadmap" action on an opportunity page or through NEXA chat
// (see ProfileContext.addRoadmapItem). These aren't part of the generated
// phase plan, so they get their own lightweight section rather than being
// forced into a phase they don't belong to.
export default function RoadmapAddedItems({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="relative pl-10">
      <span
        className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: "var(--surface-muted)", color: "var(--text-tertiary)" }}
      >
        <Plus size={13} />
      </span>
      <div className="nexa-card rounded-[var(--radius-lg)] p-5">
        <div className="font-display text-[1.15rem]">Added by you</div>
        <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>
          Saved from opportunities and NEXA chat.
        </p>
        <ul className="mt-3 space-y-2">
          {items.map((label) => (
            <li key={label} className="text-[13.5px] font-medium" style={{ color: "var(--text-primary)" }}>· {label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
