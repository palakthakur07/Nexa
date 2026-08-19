// The six "mini interface" contents shown as floating screens in the hero.
// Kept together since they're small and share the same chrome header.
import Avatar from "../ui/Avatar.jsx";
import MatchRing from "../ui/MatchRing.jsx";

export function ScreenChrome({ path }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <div className="flex gap-1">
        <span className="screen-chrome-dot" style={{ background: "#E3B7A9" }} />
        <span className="screen-chrome-dot" style={{ background: "#D9C9A0" }} />
        <span className="screen-chrome-dot" style={{ background: "#A9C4A6" }} />
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{path}</span>
    </div>
  );
}

export function OpportunityScreen() {
  return (
    <>
      <ScreenChrome path="Nexa / Discover" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13.5px] font-semibold leading-tight">AI Fellowship</div>
          <div className="text-[10.5px]" style={{ color: "var(--text-secondary)" }}>Fully funded</div>
        </div>
        <MatchRing value={94} size={36} />
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
        <span>Deadline</span><span className="font-semibold" style={{ color: "var(--text-secondary)" }}>14 Sep</span>
      </div>
      <div className="mt-2.5 rounded-full py-1.5 text-center text-[10.5px] font-semibold" style={{ background: "var(--accent-strong)", color: "#fff" }}>View opportunity</div>
    </>
  );
}

export function PeopleScreen() {
  return (
    <>
      <ScreenChrome path="Nexa / People" />
      <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Women who've been there</div>
      <div className="mt-1.5 flex -space-x-2"><Avatar initials="A" size={26} /><Avatar initials="R" size={26} /><Avatar initials="M" size={26} /></div>
      <div className="mt-2 text-[13px] font-semibold">3 people you should meet</div>
    </>
  );
}

export function RoadmapScreen() {
  return (
    <>
      <ScreenChrome path="Nexa / Roadmap" />
      <div className="text-[13px] font-semibold">Study abroad</div>
      <div className="mt-2.5 flex items-center gap-1">
        {["Discover", "Fund", "Connect", "Apply"].map((s, i) => (
          <div key={s} className="h-1.5 flex-1 rounded-full" style={{ background: i < 3 ? "var(--accent-strong)" : "var(--surface-muted)" }} />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10.5px]" style={{ color: "var(--text-secondary)" }}>
        <span>Next: fund</span><span className="font-display text-[15px]" style={{ color: "var(--text-primary)" }}>72%</span>
      </div>
    </>
  );
}

export function NexaScreen() {
  return (
    <>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="anim-glow inline-block h-2 w-2 rounded-full" style={{ background: "var(--accent-strong)" }} />
        <span className="text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Nexa · active</span>
      </div>
      <div className="font-display text-[14.5px] leading-snug">"I found something you shouldn't miss."</div>
    </>
  );
}

export function FundingScreen() {
  return (
    <>
      <ScreenChrome path="Nexa / Funding" />
      <div className="font-display text-[19px]">₹3.2L</div>
      <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Potential funding</div>
    </>
  );
}

export function CommunityScreen() {
  return (
    <>
      <ScreenChrome path="Nexa / Communities" />
      <div className="font-display text-[19px]">8</div>
      <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Relevant communities</div>
    </>
  );
}
