import { useState } from "react";
import { GraduationCap, Sparkles, ListChecks, Target, ArrowUpRight } from "lucide-react";

// Rendered inside the MacBook screen cutout on the landing hero. A
// hub-and-spoke diagram: headline + subtitle up top, four feature cards in
// the corners, each connected by a dashed curve to the NEXA mark in the
// center. Card positions and connector paths are defined in one shared
// logical coordinate space (LOGICAL_W x LOGICAL_H) so the SVG curves and
// the HTML cards always line up, at any render size. The connector anchor
// on each card is its literal inner corner, so the line always touches the
// card exactly rather than floating near it.
const LOGICAL_W = 1000;
const LOGICAL_H = 640;
const CARD_W = 330;
const CARD_H = 178;

const RAW_ITEMS = [
  { key: "opportunities", icon: GraduationCap, title: "Opportunities", desc: "Curated and verified opportunities that fit you.", corner: "top-left" },
  { key: "insights", icon: Sparkles, title: "Insights", desc: "Smart, AI-guided suggestions tailored to you.", corner: "top-right" },
  { key: "plan", icon: ListChecks, title: "Plan", desc: "Personalized roadmap to help you stay focused.", corner: "bottom-left" },
  { key: "action", icon: Target, title: "Action", desc: "Track progress, take action and move forward.", corner: "bottom-right" },
];

const CENTER = { x: 500, y: 322 };
const RING_R = 112;

function boxFor(corner) {
  const left = corner.includes("left") ? 28 : LOGICAL_W - 28 - CARD_W;
  const top = corner.includes("top") ? 56 : LOGICAL_H - 56 - CARD_H;
  return { x: left, y: top, w: CARD_W, h: CARD_H };
}
// The anchor is the card's literal inner corner (the corner nearest center).
function anchorFor(box, corner) {
  return {
    x: corner.includes("left") ? box.x + box.w : box.x,
    y: corner.includes("top") ? box.y + box.h : box.y,
  };
}
// Point on the dashed ring around the center mark, in the anchor's direction.
function ringPointFor(anchor) {
  const dx = CENTER.x - anchor.x;
  const dy = CENTER.y - anchor.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: CENTER.x - (dx / len) * RING_R, y: CENTER.y - (dy / len) * RING_R };
}

const ITEMS = RAW_ITEMS.map((it) => {
  const box = boxFor(it.corner);
  const anchor = anchorFor(box, it.corner);
  const ring = ringPointFor(anchor);
  return { ...it, box, anchor, ring };
});

function pct(v, total) { return `${(v / total) * 100}%`; }

function connectorPath({ anchor, ring }) {
  const midX = (anchor.x + ring.x) / 2;
  const midY = (anchor.y + ring.y) / 2;
  return `M ${anchor.x} ${anchor.y} Q ${midX} ${anchor.y}, ${midX} ${midY} T ${ring.x} ${ring.y}`;
}

function Card({ item, isActive, onEnter, onLeave, onToggle, delay }) {
  return (
    <button
      type="button"
      onMouseEnter={() => onEnter(item.key)}
      onMouseLeave={onLeave}
      onFocus={() => onEnter(item.key)}
      onBlur={onLeave}
      onClick={() => onToggle(item.key)}
      className="nexa-screen-fade nexa-card-btn absolute flex cursor-pointer flex-col gap-1.5 rounded-[11px] p-2.5 text-left"
      style={{
        left: pct(item.box.x, LOGICAL_W), top: pct(item.box.y, LOGICAL_H),
        width: pct(item.box.w, LOGICAL_W), height: pct(item.box.h, LOGICAL_H),
        background: "var(--surface)",
        border: `1px solid ${isActive ? "var(--accent-strong)" : "var(--border)"}`,
        boxShadow: isActive ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: isActive ? "translateY(-1px)" : "none",
        transition: "all 220ms var(--ease-standard, ease)",
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <div
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: 17, height: 17,
            background: isActive ? "var(--accent-strong)" : "var(--accent-soft)",
            color: isActive ? "#fff" : "var(--accent-strong)",
            transition: "all 220ms var(--ease-standard, ease)",
          }}
        >
          <item.icon size={9.5} />
        </div>
        <div className="flex-1 truncate font-display text-[9px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>{item.title}</div>
        <div
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{ width: 13, height: 13, background: "var(--surface-muted)", color: "var(--accent-strong)" }}
        >
          <ArrowUpRight size={7.5} />
        </div>
      </div>
      <div className="text-[7.2px] leading-snug" style={{ color: "var(--text-secondary)" }}>{item.desc}</div>
    </button>
  );
}

export default function NexaScreenPreview() {
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);
  const active = pinned || hovered;

  return (
    <div className="relative flex h-full w-full flex-col items-center px-[3%] pb-[3%] pt-[5%]" style={{ background: "var(--bg)" }}>
      <style>{`
        @keyframes nexaScreenFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .nexa-screen-fade { animation: nexaScreenFadeUp 460ms var(--ease-standard, ease) both; }
        .nexa-card-btn:hover { border-color: var(--accent-strong) !important; box-shadow: var(--shadow-md) !important; }
      `}</style>

      <div className="nexa-screen-fade text-center font-display" style={{ fontSize: 12, lineHeight: 1.3, color: "var(--text-primary)" }}>
        NEXA is your companion for <span style={{ color: "var(--accent-strong)" }}>progress.</span>
      </div>
      <div className="nexa-screen-fade mt-1 max-w-[78%] text-center" style={{ fontSize: 6.8, lineHeight: 1.4, color: "var(--text-secondary)", animationDelay: "80ms" }}>
        Discover opportunities, get personalized guidance, and take meaningful action — all in one place.
      </div>

      <div className="relative mt-[2%] w-full flex-1">
        <svg viewBox={`0 0 ${LOGICAL_W} ${LOGICAL_H}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
          {ITEMS.map((item) => {
            const isActive = active === item.key;
            const color = isActive ? "var(--accent-strong)" : "var(--border-strong)";
            return (
              <g key={item.key}>
                <path d={connectorPath(item)} fill="none" stroke={color} strokeWidth={isActive ? 2 : 1.4} strokeDasharray="4 5" style={{ transition: "stroke 220ms ease, stroke-width 220ms ease" }} />
                <circle cx={item.anchor.x} cy={item.anchor.y} r={5} fill={color} style={{ transition: "fill 220ms ease" }} />
                <circle cx={item.ring.x} cy={item.ring.y} r={5} fill={color} style={{ transition: "fill 220ms ease" }} />
              </g>
            );
          })}
          <circle cx={CENTER.x} cy={CENTER.y} r={RING_R} fill="none" stroke="var(--border-strong)" strokeWidth={1.4} strokeDasharray="3 6" opacity={0.7} />
          {/* Center mark drawn in SVG (not HTML) so it's guaranteed concentric with the ring above, at any render size. */}
          <circle cx={CENTER.x} cy={CENTER.y} r={62} fill="var(--accent-soft)" opacity={0.55} />
          <circle cx={CENTER.x} cy={CENTER.y} r={36} fill="var(--accent-strong)" />
          <circle cx={CENTER.x} cy={CENTER.y} r={36} fill="url(#nexaOrbShine)" />
          <text x={CENTER.x} y={CENTER.y + 6} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="17" fill="#fff">N</text>
          <circle cx={CENTER.x + 13} cy={CENTER.y - 12} r={2.4} fill="#fff" />
          <defs>
            <radialGradient id="nexaOrbShine" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {ITEMS.map((item, i) => (
          <Card
            key={item.key}
            item={item}
            isActive={active === item.key}
            onEnter={setHovered}
            onLeave={() => setHovered(null)}
            onToggle={(key) => setPinned((p) => (p === key ? null : key))}
            delay={260 + i * 70}
          />
        ))}
      </div>
    </div>
  );
}