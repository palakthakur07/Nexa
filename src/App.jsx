import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Search, ArrowRight, ArrowUpRight, Compass, Users, MapPin,
  Heart, ChevronRight, Check, X, Clock, GraduationCap, Rocket,
  Wallet, ArrowLeft, CircleDot, Activity,
} from "lucide-react";

/* ============================================================================
   NEXA — PHASE 1 (v3) · HERO AS A 3D SCENE
   ----------------------------------------------------------------------------
   This replaces the v2 hero (which faked depth with scale + opacity on a flat
   plane) with an actual CSS 3D scene: a perspective camera, a preserve-3d
   stage, and screens placed with translate3d(x, y, z) so depth comes from
   real perspective projection, not layout tricks. An idle camera drift plus
   cursor-driven rotation of the whole stage produce the parallax — nothing
   is animated per-card independently of the scene.
   Sections below the hero are unchanged from the prior pass.
============================================================================ */

const TOKENS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,340..600&family=Manrope:wght@400;500;600;700;800&display=swap');

  #nexa-landing {
    --bg: #FBF7F3;
    --surface: #FFFFFF;
    --surface-muted: #FBEEEA;
    --surface-muted-strong: #F6E1DA;

    --text-primary: #2B2422;
    --text-secondary: #8A7B76;
    --text-tertiary: #B7ABA5;
    --text-on-accent: #FFFFFF;

    --accent: #C97B86;
    --accent-hover: #BD6874;
    --accent-soft: #F0D9DC;
    --accent-strong: #8C4B57;

    --border: #EAE0DB;
    --border-strong: #DDCEC7;

    --success: #7C9A78;
    --success-soft: #E7EFE3;

    --font-display: 'Fraunces', Georgia, serif;
    --font-ui: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;

    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 22px;
    --radius-xl: 30px;

    --shadow-sm: 0 1px 2px rgba(140,75,87,0.06), 0 1px 1px rgba(43,36,34,0.04);
    --shadow-md: 0 8px 24px rgba(140,75,87,0.10), 0 2px 6px rgba(43,36,34,0.05);
    --shadow-lg: 0 26px 60px rgba(140,75,87,0.20), 0 10px 22px rgba(43,36,34,0.08);

    --ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --dur-fast: 150ms;
    --dur-standard: 280ms;

    background: var(--bg);
    color: var(--text-primary);
    font-family: var(--font-ui);
    position: relative;
    overflow-x: hidden;
  }

  #nexa-landing * { box-sizing: border-box; }
  #nexa-landing .font-display { font-family: var(--font-display); }
  #nexa-landing ::selection { background: var(--accent-soft); color: var(--accent-strong); }
  #nexa-landing :focus-visible { outline: 2px solid var(--accent-strong); outline-offset: 2px; border-radius: 6px; }
  #nexa-landing button { font-family: inherit; }

  #nexa-landing .t-fast { transition: all var(--dur-fast) var(--ease-standard); }
  #nexa-landing .t-standard { transition: all var(--dur-standard) var(--ease-standard); }
  #nexa-landing .t-spring { transition: all var(--dur-standard) var(--ease-spring); }

  #nexa-landing .nexa-btn-primary { background: var(--accent-strong); color: var(--text-on-accent); }
  #nexa-landing .nexa-btn-primary:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  #nexa-landing .nexa-btn-secondary { background: var(--surface); color: var(--text-primary); border: 1px solid var(--border-strong); }
  #nexa-landing .nexa-btn-secondary:hover:not(:disabled) { background: var(--surface-muted); border-color: var(--accent-strong); }
  #nexa-landing .nexa-btn-ghost { background: transparent; color: var(--text-primary); }
  #nexa-landing .nexa-btn-ghost:hover:not(:disabled) { background: var(--surface-muted); }

  #nexa-landing .nexa-card { background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
  #nexa-landing .nexa-panel { background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-md); }

  #nexa-landing .nexa-ai-input { background: var(--surface); border: 1px solid var(--border-strong); box-shadow: var(--shadow-sm); }
  #nexa-landing .nexa-ai-input:focus-within { border-color: var(--accent-strong); box-shadow: var(--shadow-md), 0 0 0 3px var(--accent-soft); }

  #nexa-landing .nexa-nav { background: transparent; border-bottom: 1px solid transparent; }
  #nexa-landing .nexa-nav[data-scrolled="true"] { background: rgba(251,247,243,0.88); backdrop-filter: blur(10px); border-bottom-color: var(--border); box-shadow: var(--shadow-sm); }
  #nexa-landing .nexa-nav-link { color: var(--text-secondary); }
  #nexa-landing .nexa-nav-link:hover { color: var(--text-primary); }

  #nexa-landing .pillar-tab { color: var(--text-tertiary); border-left: 2px solid var(--border); }
  #nexa-landing .pillar-tab[data-active="true"] { color: var(--text-primary); border-left-color: var(--accent-strong); }
  #nexa-landing .pillar-tab:hover { color: var(--text-primary); }

  #nexa-landing .chip { background: var(--surface); border: 1px solid var(--border); color: var(--text-secondary); }
  #nexa-landing .chip:hover { border-color: var(--accent); color: var(--accent-strong); background: var(--accent-soft); }

  #nexa-landing .no-scrollbar::-webkit-scrollbar { display: none; }
  #nexa-landing .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  #nexa-landing .reveal { opacity: 0; transform: translateY(22px); transition: opacity 700ms var(--ease-standard), transform 700ms var(--ease-standard); }
  #nexa-landing .reveal.in { opacity: 1; transform: translateY(0); }

  @keyframes nexa-pulse-soft { 0%,100% { opacity:1; transform: scale(1);} 50% { opacity:0.85; transform: scale(1.04);} }
  @keyframes nexa-glow { 0%,100% { opacity:0.5;} 50% { opacity:1;} }
  @keyframes nexa-drawer-in { from { opacity:0; transform: translateY(24px) scale(0.98);} to { opacity:1; transform: translateY(0) scale(1);} }
  #nexa-landing .anim-pulse { animation: nexa-pulse-soft 3.2s ease-in-out infinite; }
  #nexa-landing .anim-glow { animation: nexa-glow 2.4s ease-in-out infinite; }
  #nexa-landing .anim-drawer { animation: nexa-drawer-in var(--dur-standard) var(--ease-spring) both; }

  /* ---------------------------------------------------------------------
     3D HERO SCENE
  --------------------------------------------------------------------- */
  #nexa-landing .hero-stage { perspective: 2100px; perspective-origin: 50% 42%; }
  #nexa-landing .hero-idle { transform-style: preserve-3d; animation: nexa-idle-drift 18s ease-in-out infinite; }
  @keyframes nexa-idle-drift {
    0%, 100% { transform: rotateY(-1.1deg) rotateX(0.5deg); }
    50% { transform: rotateY(1.1deg) rotateX(-0.5deg); }
  }
  #nexa-landing .hero-camera { transform-style: preserve-3d; transition: transform 500ms cubic-bezier(0.22,1,0.36,1); will-change: transform; }
  #nexa-landing .screen-3d { position: absolute; left: 50%; top: 50%; transform-style: preserve-3d; will-change: transform; }
  #nexa-landing .screen-3d-float { transform-style: preserve-3d; animation-name: nexa-float-3d; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
  @keyframes nexa-float-3d {
    0%, 100% { transform: translate3d(0px, 0px, 0px) rotateZ(0deg); }
    50% { transform: translate3d(var(--fx, 0px), var(--fy, -8px), var(--fz, 0px)) rotateZ(var(--fr, 0deg)); }
  }
  #nexa-landing .screen-3d-card {
    transition: transform 360ms var(--ease-spring), box-shadow 360ms var(--ease-standard), border-color 360ms var(--ease-standard), filter 360ms var(--ease-standard);
    transform: translateZ(0px) scale(1);
  }
  #nexa-landing .screen-3d:hover .screen-3d-float { animation-play-state: paused; }
  #nexa-landing .screen-3d:hover .screen-3d-card,
  #nexa-landing .screen-3d:focus-within .screen-3d-card {
    transform: translateZ(46px) scale(1.06);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-strong);
    filter: brightness(1.02);
  }
  #nexa-landing .hero-camera:has(.screen-3d:hover) .screen-3d:not(:hover) .screen-3d-card { filter: brightness(0.98) saturate(0.94); opacity: 0.88; }
  #nexa-landing .screen-chrome-dot { width: 6px; height: 6px; border-radius: 50%; }

  @media (prefers-reduced-motion: reduce) {
    #nexa-landing .screen-3d-float, #nexa-landing .hero-idle { animation: none !important; }
    #nexa-landing .hero-camera { transition: none !important; }
    #nexa-landing .anim-pulse, #nexa-landing .anim-glow { animation: none !important; }
    #nexa-landing .reveal { transition: opacity 300ms linear; transform: none !important; }
  }
`;

/* ---------- scroll reveal hook ---------- */
function useReveal() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children, as: As = "div", className = "", delay = 0 }) {
  const [ref, inView] = useReveal();
  return (
    <As ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}>
      {children}
    </As>
  );
}

/* ---------- camera parallax: rotates the whole 3D stage, not individual cards ---------- */
function useCameraParallax(maxDeg = 5) {
  const cameraRef = useRef(null);
  useEffect(() => {
    const el = cameraRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = !window.matchMedia("(pointer: fine)").matches;
    if (reduce || coarse) return;
    const stage = el.closest(".hero-stage");
    let raf = null;
    const onMove = (e) => {
      const rect = stage.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `rotateY(${(nx * maxDeg).toFixed(2)}deg) rotateX(${(-ny * maxDeg * 0.6).toFixed(2)}deg)`;
      });
    };
    const onLeave = () => { el.style.transform = "rotateY(0deg) rotateX(0deg)"; };
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    return () => {
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [maxDeg]);
  return cameraRef;
}

/* ============================================================================
   PRIMITIVES
============================================================================ */

function Button({ children, variant = "primary", size = "md", icon: Icon, iconRight = false, onClick }) {
  const variantClass = { primary: "nexa-btn-primary", secondary: "nexa-btn-secondary", ghost: "nexa-btn-ghost" }[variant];
  const sizeClass = { sm: "text-[13px] px-3.5 py-2 gap-1.5", md: "text-[14px] px-5 py-2.5 gap-2", lg: "text-[15.5px] px-7 py-3.5 gap-2.5" }[size];
  return (
    <button onClick={onClick} className={`t-spring inline-flex items-center justify-center rounded-full font-semibold ${variantClass} ${sizeClass}`}>
      {Icon && !iconRight && <Icon size={16} />}
      {children}
      {Icon && iconRight && <Icon size={16} />}
    </button>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "var(--surface-muted)", fg: "var(--accent-strong)" },
    accent: { bg: "var(--accent)", fg: "var(--text-on-accent)" },
  }[tone];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: tones.bg, color: tones.fg }}>
      {children}
    </span>
  );
}

function Avatar({ initials, size = 40 }) {
  return (
    <div className="flex items-center justify-center rounded-full font-semibold" style={{ width: size, height: size, background: "var(--accent-soft)", color: "var(--accent-strong)", fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

/* ============================================================================
   CHARACTER — defined asset slot, exact frame, transparent-background ready
============================================================================ */
function Character({ src, alt = "NEXA character visual", width = 300, height = 480 }) {
  if (src) {
    return <img src={src} alt={alt} width={width} height={height} style={{ width, height, objectFit: "contain", display: "block" }} draggable={false} />;
  }
  return (
    <svg viewBox="0 0 300 480" width={width} height={height} role="img" aria-label={alt} style={{ display: "block" }}>
      <ellipse cx="150" cy="464" rx="104" ry="13" fill="var(--surface-muted-strong)" opacity="0.5" />
      <path d="M42 464 C32 306 56 196 150 176 C244 196 268 306 258 464 Z" fill="var(--surface-muted-strong)" />
      <path d="M76 464 C71 326 87 234 150 216 C213 234 229 326 224 464 Z" fill="var(--accent-soft)" opacity="0.92" />
      <circle cx="150" cy="150" r="80" fill="var(--surface-muted-strong)" />
      <path d="M74 130 C74 76 108 42 150 42 C192 42 226 76 226 130 C226 152 219 171 209 185 C214 152 205 118 183 99 C194 118 194 139 184 152 C176 122 154 105 125 103 C140 111 148 124 148 138 C130 117 102 111 82 121 C88 156 98 177 110 187 C88 179 74 156 74 130 Z" fill="var(--accent-strong)" />
      <circle cx="150" cy="159" r="61" fill="none" stroke="var(--accent-strong)" strokeOpacity="0.16" strokeWidth="1.4" />
      <ellipse cx="123" cy="153" rx="4" ry="5.4" fill="var(--surface)" opacity="0.85" />
      <ellipse cx="174" cy="153" rx="4" ry="5.4" fill="var(--surface)" opacity="0.85" />
      <path d="M131 183 Q150 194 169 183" stroke="var(--surface)" strokeOpacity="0.5" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================================
   MINI-INTERFACE SCREENS
============================================================================ */

function ScreenChrome({ path, label }) {
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

function OpportunityScreen() {
  return (
    <>
      <ScreenChrome path="Nexa / Discover" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13.5px] font-semibold leading-tight">AI Fellowship</div>
          <div className="text-[10.5px]" style={{ color: "var(--text-secondary)" }}>Fully funded</div>
        </div>
        <div className="relative h-9 w-9 shrink-0">
          <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--surface-muted)" strokeWidth="4" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--accent-strong)" strokeWidth="4" strokeDasharray={2 * Math.PI * 15} strokeDashoffset={2 * Math.PI * 15 * 0.06} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">94%</div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
        <span>Deadline</span><span className="font-semibold" style={{ color: "var(--text-secondary)" }}>14 Sep</span>
      </div>
      <div className="mt-2.5 rounded-full py-1.5 text-center text-[10.5px] font-semibold" style={{ background: "var(--accent-strong)", color: "#fff" }}>View opportunity</div>
    </>
  );
}

function PeopleScreen() {
  return (
    <>
      <ScreenChrome path="Nexa / People" />
      <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Women who've been there</div>
      <div className="mt-1.5 flex -space-x-2">
        <Avatar initials="A" size={26} /><Avatar initials="R" size={26} /><Avatar initials="M" size={26} />
      </div>
      <div className="mt-2 text-[13px] font-semibold">3 people you should meet</div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {["AI research", "Startups", "Study abroad"].map((t) => (
          <span key={t} className="rounded-full px-2 py-0.5 text-[9.5px] font-medium" style={{ background: "var(--surface-muted)", color: "var(--accent-strong)" }}>{t}</span>
        ))}
      </div>
    </>
  );
}

function RoadmapScreen() {
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
        <span>Next: fund</span>
        <span className="font-display text-[15px]" style={{ color: "var(--text-primary)" }}>72%</span>
      </div>
    </>
  );
}

function NexaScreen() {
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

function FundingScreen() {
  return (
    <>
      <ScreenChrome path="Nexa / Funding" />
      <div className="font-display text-[19px]">₹3.2L</div>
      <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Potential funding</div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {["Scholarships", "Grants"].map((t) => (
          <span key={t} className="rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ background: "var(--surface-muted)", color: "var(--accent-strong)" }}>{t}</span>
        ))}
      </div>
    </>
  );
}

function CommunityScreen() {
  return (
    <>
      <ScreenChrome path="Nexa / Communities" />
      <div className="font-display text-[19px]">8</div>
      <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Relevant communities</div>
    </>
  );
}

/* ============================================================================
   FLOATING SCREEN — real translate3d(x, y, z) placement inside preserve-3d
============================================================================ */

function FloatingScreen({ cfg, onClick }) {
  const { x, y, z, rotate, scale, width, float, label, far } = cfg;
  const rootTransform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) rotateZ(${rotate.z}deg) scale(${scale})`;
  return (
    <button onClick={onClick} aria-label={`Open ${label}`} className="screen-3d text-left" style={{ width, zIndex: Math.round(z + 300), transform: rootTransform }}>
      <div className="screen-3d-float" style={{ "--fx": `${float.fx}px`, "--fy": `${float.fy}px`, "--fz": `${float.fz}px`, "--fr": `${float.fr}deg`, animationDuration: `${float.dur}s`, animationDelay: `${float.delay}s` }}>
        <div className="screen-3d-card nexa-panel rounded-[var(--radius-md)] p-3.5" style={{ opacity: far ? 0.78 : 1, filter: far ? "blur(0.5px)" : "none" }}>
          {cfg.render()}
        </div>
      </div>
    </button>
  );
}

/* ============================================================================
   HERO SCENE
============================================================================ */

function buildScreens(navigate) {
  return [
    // background — far from camera, small, blurred
    { id: "funding", label: "Funding", x: 300, y: -215, z: -230, scale: 0.82, rotate: { x: 3, y: -16, z: 2 }, width: 140, far: true, float: { fx: 5, fy: -7, fz: -6, fr: 0.6, dur: 10, delay: -0.6 }, render: () => <FundingScreen />, route: "discover" },
    { id: "community", label: "Communities", x: 40, y: 250, z: -260, scale: 0.8, rotate: { x: -3, y: 10, z: -1 }, width: 130, far: true, float: { fx: -5, fy: -6, fz: -5, fr: -0.7, dur: 11, delay: -3.8 }, render: () => <CommunityScreen />, route: "people" },
    // midground — behind or beside the character
    { id: "people", label: "People who've been there", x: -300, y: -185, z: -60, scale: 0.98, rotate: { x: 2, y: 14, z: 1.4 }, width: 180, far: false, float: { fx: -6, fy: -10, fz: 6, fr: 0.9, dur: 8, delay: -2.1 }, render: () => <PeopleScreen />, route: "people" },
    // hero-foreground detail, overlaps her shoulder
    { id: "nexa", label: "Nexa", x: -50, y: -235, z: 60, scale: 1, rotate: { x: 1, y: -8, z: -1.6 }, width: 168, far: false, float: { fx: 5, fy: -8, fz: 8, fr: -0.8, dur: 7, delay: -1.3 }, render: () => <NexaScreen /> },
    // foreground — large, closest to camera
    { id: "opportunity", label: "Opportunities", x: -330, y: 120, z: 120, scale: 1, rotate: { x: -1, y: 13, z: -2.4 }, width: 212, far: false, float: { fx: -7, fy: 8, fz: 10, fr: -1, dur: 6.4, delay: -1.1 }, render: () => <OpportunityScreen />, route: "discover" },
    { id: "roadmap", label: "Your roadmap", x: 305, y: 145, z: 100, scale: 1, rotate: { x: 2, y: -12, z: 2.2 }, width: 210, far: false, float: { fx: 7, fy: 10, fz: 9, fr: 1, dur: 6.9, delay: -3.6 }, render: () => <RoadmapScreen />, route: "roadmap" },
  ].map((s) => ({ ...s, onClick: s.route ? () => navigate(s.route) : undefined }));
}

function HeroScene({ onNavigate, onStartNexa, characterSrc }) {
  const cameraRef = useCameraParallax(5);
  const screens = buildScreens(onNavigate);
  const background = screens.filter((s) => s.z < -100);
  const midground = screens.filter((s) => s.z >= -100 && s.z < 40);
  const foreground = screens.filter((s) => s.z >= 40);

  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-14 md:px-8 md:pt-16">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 h-[620px] w-[1000px] -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(201,123,134,0.14), rgba(201,123,134,0))" }} />

      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal><Badge tone="neutral"><Sparkles size={12} /> Your journey, your guide</Badge></Reveal>
        <Reveal delay={80}><h1 className="font-display mt-5 text-[2.6rem] leading-[1.05] md:text-[3.6rem]">Find what's next.</h1></Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Discover opportunities, meet women who've already walked the path, and turn a goal into a plan you can actually follow.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="lg" icon={Sparkles} onClick={onStartNexa}>Start with Nexa</Button>
            <a href="#problem"><Button variant="secondary" size="lg">Explore</Button></a>
          </div>
        </Reveal>
      </div>

      {/* Desktop / tablet: real 3D stage */}
      <div className="hero-stage relative mx-auto mt-8 hidden md:block" style={{ height: 620, maxWidth: 1040 }}>
        <div className="hero-idle relative h-full w-full">
          <div ref={cameraRef} className="hero-camera relative h-full w-full">
            {background.map((s) => <FloatingScreen key={s.id} cfg={s} onClick={s.onClick} />)}

            <div className="absolute left-1/2 top-1/2" style={{ transform: "translate3d(-50%, -46%, 20px)", zIndex: 320 }}>
              <Character src={characterSrc} />
            </div>

            {midground.map((s) => <FloatingScreen key={s.id} cfg={s} onClick={s.onClick} />)}
            {foreground.map((s) => <FloatingScreen key={s.id} cfg={s} onClick={s.onClick} />)}
          </div>
        </div>
      </div>

      {/* Mobile: deliberate flat composition — character + 3 primary interfaces */}
      <div className="mt-8 md:hidden">
        <div className="mx-auto flex justify-center"><Character src={characterSrc} width={220} height={352} /></div>
        <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2">
          {["opportunity", "roadmap", "people"].map((id) => {
            const s = screens.find((sc) => sc.id === id);
            return (
              <button key={id} onClick={s.onClick} className="nexa-panel shrink-0 rounded-[var(--radius-md)] p-3.5 text-left" style={{ width: 178 }}>
                {s.render()}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   SECTION 2 — SCATTERED TO CONNECTED
============================================================================ */

const scatterWords = ["Scholarship", "Mentor", "Grant", "Community", "Fellowship", "Returnship", "Workshop"];

function ProblemSection() {
  const [ref, inView] = useReveal();
  return (
    <section id="problem" className="px-6 py-24 md:px-10" ref={ref}>
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>The problem</div>
        <h2 className="font-display mt-3 text-[2rem] leading-tight md:text-[2.5rem]">Your next opportunity shouldn't depend on knowing where to look.</h2>
      </div>
      <div className="relative mx-auto mt-14 max-w-3xl" style={{ height: 160 }}>
        {scatterWords.map((w, i) => {
          const scattered = [
            { top: "4%", left: "2%", rot: -8 }, { top: "40%", left: "18%", rot: 6 },
            { top: "0%", left: "44%", rot: 4 }, { top: "55%", left: "58%", rot: -5 },
            { top: "10%", left: "76%", rot: 7 }, { top: "60%", left: "8%", rot: -3 },
            { top: "35%", left: "84%", rot: -6 },
          ][i];
          return (
            <span key={w} className="t-standard absolute rounded-full px-4 py-2 text-[13px] font-medium" style={{
              background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-sm)",
              top: inView ? "50%" : scattered.top, left: inView ? `${(i / (scatterWords.length - 1)) * 88}%` : scattered.left,
              transform: inView ? "translateY(-50%) rotate(0deg)" : `rotate(${scattered.rot}deg)`, transitionDelay: `${i * 60}ms`,
            }}>
              {w}
            </span>
          );
        })}
      </div>
      <p className="mx-auto mt-10 max-w-md text-center text-[14px]" style={{ color: "var(--text-secondary)" }}>NEXA gathers them into one place — matched to you, not just searchable.</p>
    </section>
  );
}

/* ============================================================================
   SECTION 3 — FOUR PILLARS
============================================================================ */

const pillars = [
  { key: "discover", label: "Discover", icon: Compass, copy: "Opportunities matched to you — scholarships, fellowships, grants and roles worth your time." },
  { key: "connect", label: "Connect", icon: Users, copy: "Women who've already walked the path you're considering, ready to talk it through." },
  { key: "plan", label: "Plan", icon: MapPin, copy: "A roadmap built around your goal, broken into steps that actually make sense." },
  { key: "move", label: "Move", icon: ArrowRight, copy: "A clear next action — never a vague list of things you should probably do." },
];

function PillarsSection({ onNavigate }) {
  const [active, setActive] = useState("discover");
  const current = pillars.find((p) => p.key === active);
  return (
    <section id="how-it-works" className="px-6 py-24 md:px-10" style={{ background: "var(--surface-muted)" }}>
      <Reveal>
        <div className="mx-auto mb-14 max-w-xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>What NEXA connects</div>
          <h2 className="font-display mt-3 text-[2rem] md:text-[2.5rem]">Four ideas, one path forward.</h2>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[220px_1fr]">
          <div className="flex flex-row gap-2 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
            {pillars.map((p) => (
              <button key={p.key} data-active={active === p.key} onClick={() => setActive(p.key)} className="pillar-tab t-fast flex shrink-0 items-center gap-2.5 px-4 py-3 text-left text-[14px] font-semibold md:px-4">
                <p.icon size={16} /> {p.label}
              </button>
            ))}
          </div>
          <div className="nexa-card rounded-[var(--radius-lg)] p-8">
            <current.icon size={26} style={{ color: "var(--accent-strong)" }} />
            <div className="font-display mt-4 text-[1.6rem]">{current.label}</div>
            <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{current.copy}</p>
            <button onClick={() => onNavigate(active === "connect" ? "people" : active === "plan" ? "roadmap" : "discover")} className="t-fast mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>
              Explore {current.label.toLowerCase()} <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================================================================
   SECTION 4 — NEXA INTELLIGENCE
============================================================================ */

function NexaIntelligenceSection() {
  return (
    <section className="px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Nexa intelligence</div>
          <h2 className="font-display mt-3 text-[2rem] md:text-[2.4rem]">Not another chatbot.</h2>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>Nexa turns scattered possibilities into a path forward — matched opportunities, people who can help, and a next step, in one place.</p>
          <div className="mt-2 text-[12px]" style={{ color: "var(--text-tertiary)" }}>Preview shown with sample data — full conversation arrives in Phase 2.</div>
        </Reveal>
        <Reveal delay={120}>
          <div className="nexa-panel rounded-[var(--radius-xl)] p-6">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-[var(--radius-md)] rounded-tr-sm px-4 py-2.5 text-[13.5px]" style={{ background: "var(--surface-muted)" }}>I want to study AI abroad but I don't have much money.</div>
            </div>
            <div className="mt-3 flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--accent-strong)" }}><Sparkles size={13} color="#fff" /></div>
              <div className="max-w-[80%] rounded-[var(--radius-md)] rounded-tl-sm px-4 py-2.5 text-[13.5px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>I can work with that.</div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {[{ n: "7", l: "opportunities" }, { n: "3", l: "funding options" }, { n: "2", l: "women to connect with" }, { n: "1", l: "suggested next step" }].map((s) => (
                <div key={s.l} className="rounded-[var(--radius-md)] p-3.5 text-center" style={{ background: "var(--surface-muted)" }}>
                  <div className="font-display text-[1.5rem]">{s.n}</div>
                  <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================================
   SECTION 5 — WOMEN WHO'VE BEEN THERE
============================================================================ */

const women = [
  { name: "Ananya", role: "AI Research · studied abroad", initials: "A", helps: ["Scholarships", "AI research", "Applications"] },
  { name: "Riya", role: "Founder · built a startup", initials: "R", helps: ["Funding", "Incubators", "Pitching"] },
  { name: "Meera", role: "Career returner", initials: "M", helps: ["Returnships", "Upskilling", "Transitions"] },
];

function WomenSection({ onNavigate }) {
  return (
    <section className="px-6 py-24 md:px-10" style={{ background: "var(--surface-muted)" }}>
      <Reveal>
        <div className="mx-auto mb-12 max-w-xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Community</div>
          <h2 className="font-display mt-3 text-[2rem] md:text-[2.5rem]">Someone has already done it.</h2>
          <p className="mt-3 text-[14.5px]" style={{ color: "var(--text-secondary)" }}>Find women who've taken the path you're considering.</p>
        </div>
      </Reveal>
      <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
        {women.map((w, i) => (
          <Reveal key={w.name} delay={i * 90}>
            <div className="nexa-card t-standard rounded-[var(--radius-lg)] p-6 hover:shadow-[var(--shadow-md)]">
              <Avatar initials={w.initials} size={44} />
              <div className="mt-3 text-[15px] font-semibold">{w.name}</div>
              <div className="text-[12.5px]" style={{ color: "var(--text-secondary)" }}>{w.role}</div>
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Can help with</div>
              <div className="mt-2 flex flex-wrap gap-1.5">{w.helps.map((h) => <Badge key={h}>{h}</Badge>)}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={280}><div className="mt-8 text-center"><Button variant="secondary" onClick={() => onNavigate("people")}>Meet more women</Button></div></Reveal>
    </section>
  );
}

/* ============================================================================
   SECTION 6 — ROADMAP VISUALIZATION
============================================================================ */

const roadmapSteps = [
  { label: "Goal", detail: "Study AI abroad" },
  { label: "Discover", detail: "Find programs" },
  { label: "Fund", detail: "Find scholarships" },
  { label: "Connect", detail: "Meet women who've done it" },
  { label: "Prepare", detail: "Build application" },
  { label: "Move", detail: "Submit application" },
];

function RoadmapSection({ onNavigate }) {
  return (
    <section className="px-6 py-24 md:px-10">
      <Reveal>
        <div className="mx-auto mb-14 max-w-xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>From information to action</div>
          <h2 className="font-display mt-3 text-[2rem] md:text-[2.5rem]">NEXA turns a goal into a path.</h2>
        </div>
      </Reveal>
      <div className="relative mx-auto max-w-md">
        <div className="absolute bottom-3 left-[15px] top-3 w-px" style={{ background: "var(--border)" }} />
        {roadmapSteps.map((s, i) => (
          <Reveal key={s.label} delay={i * 90} className="relative flex items-start gap-4 pb-8 last:pb-0">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: i === 0 ? "var(--accent-strong)" : "var(--surface)", border: `1px solid ${i === 0 ? "var(--accent-strong)" : "var(--border-strong)"}` }}>
              <CircleDot size={13} color={i === 0 ? "#fff" : "var(--text-tertiary)"} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>{s.label}</div>
              <div className="text-[14.5px] font-medium">{s.detail}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={roadmapSteps.length * 90}><div className="mt-4 text-center"><Button variant="secondary" onClick={() => onNavigate("roadmap")}>See your roadmap</Button></div></Reveal>
    </section>
  );
}

/* ============================================================================
   FINAL CTA + FOOTER
============================================================================ */

function FinalCTASection({ onStartNexa, onNavigate }) {
  return (
    <section className="px-6 py-24 text-center md:px-10">
      <Reveal>
        <h2 className="font-display mx-auto max-w-xl text-[2.2rem] leading-tight md:text-[2.8rem]">Your next move is closer than you think.</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="lg" icon={Sparkles} onClick={onStartNexa}>Start with Nexa</Button>
          <Button variant="secondary" size="lg" onClick={() => onNavigate("discover")}>Explore opportunities</Button>
        </div>
      </Reveal>
    </section>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer className="px-6 py-12 md:px-10" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <div className="font-display text-[17px]">NEXA</div>
          <div className="text-[12.5px]" style={{ color: "var(--text-secondary)" }}>Find what's next.</div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          <button onClick={() => onNavigate("discover")} className="nexa-nav-link t-fast">Discover</button>
          <button onClick={() => onNavigate("people")} className="nexa-nav-link t-fast">People</button>
          <a href="#how-it-works" className="nexa-nav-link t-fast">How it works</a>
          <span className="nexa-nav-link">About</span>
          <span className="nexa-nav-link">Privacy</span>
          <span className="nexa-nav-link">Terms</span>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================================
   NAV
============================================================================ */

function NavBar({ onNavigate, onStartNexa }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header data-scrolled={scrolled} className="nexa-nav t-standard sticky top-0 z-30 flex items-center justify-between px-6 py-4 md:px-10">
      <button onClick={() => onNavigate("home")} className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-full font-display text-[15px]" style={{ width: 32, height: 32, background: "var(--accent-strong)", color: "#fff" }}>N</div>
        <span className="font-display text-[19px]">NEXA</span>
      </button>
      <nav className="hidden items-center gap-7 md:flex">
        <button onClick={() => onNavigate("discover")} className="nexa-nav-link t-fast text-[13.5px] font-medium">Discover</button>
        <button onClick={() => onNavigate("people")} className="nexa-nav-link t-fast text-[13.5px] font-medium">People</button>
        <a href="#how-it-works" className="nexa-nav-link t-fast text-[13.5px] font-medium">How it works</a>
      </nav>
      <div className="flex items-center gap-3">
        <button className="nexa-nav-link t-fast hidden text-[13.5px] font-medium sm:block">Sign in</button>
        <Button variant="primary" size="sm" onClick={onStartNexa}>Start with Nexa</Button>
      </div>
    </header>
  );
}

/* ============================================================================
   NEXA DRAWER
============================================================================ */

const nexaSuggestions = ["Study abroad", "Find an internship", "Start a business", "Return to work", "Find a mentor", "Grow my career"];

function NexaDrawer({ open, onClose }) {
  const [value, setValue] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/20 p-4 md:items-center" style={{ backdropFilter: "blur(2px)" }} onClick={onClose}>
      <div className="anim-drawer nexa-panel w-full max-w-md rounded-[var(--radius-xl)] p-7" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="anim-glow flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "var(--accent-strong)" }}><Sparkles size={14} color="#fff" /></div>
            <span className="font-display text-[17px]">Nexa</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="t-fast rounded-full p-1.5 hover:bg-[var(--surface-muted)]"><X size={18} style={{ color: "var(--text-secondary)" }} /></button>
        </div>
        <p className="font-display mt-5 text-[1.5rem] leading-snug">Tell me what you're working toward.</p>
        <div className="nexa-ai-input t-standard mt-5 flex items-center gap-2.5 rounded-full py-2.5 pl-4 pr-2.5">
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="What are you hoping to do next?" className="w-full bg-transparent text-[14px] outline-none" />
          <button aria-label="Send" className="nexa-btn-primary t-spring flex shrink-0 items-center justify-center rounded-full" style={{ width: 36, height: 36 }}><ArrowRight size={15} /></button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {nexaSuggestions.map((s) => (
            <button key={s} onClick={() => setValue(s)} className="chip t-fast rounded-full px-3 py-1.5 text-[12.5px] font-medium">{s}</button>
          ))}
        </div>
        <div className="mt-5 text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>This preview is visually functional with sample suggestions — full conversational matching arrives in Phase 2.</div>
      </div>
    </div>
  );
}

/* ============================================================================
   PLACEHOLDER ROUTES
============================================================================ */

const routeContent = {
  discover: { title: "Discover", eyebrow: "/discover", copy: "This is where NEXA will surface opportunities matched to your goals — scholarships, fellowships, grants and roles. The full Opportunity Hub arrives in a later phase.", icon: Compass },
  people: { title: "People", eyebrow: "/people", copy: "This is where you'll browse and connect with women who've already walked the path you're considering. The full People experience arrives in a later phase.", icon: Users },
  roadmap: { title: "Roadmap", eyebrow: "/roadmap", copy: "This is where your goal becomes a personalized, trackable plan. The full Roadmap experience arrives in a later phase.", icon: MapPin },
};

function PlaceholderRoute({ route, onBack }) {
  const r = routeContent[route];
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}><r.icon size={24} style={{ color: "var(--accent-strong)" }} /></div>
      <div className="mt-5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>{r.eyebrow}</div>
      <h1 className="font-display mt-2 text-[2.2rem]">{r.title}</h1>
      <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.copy}</p>
      <button onClick={onBack} className="t-fast mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--accent-strong)" }}><ArrowLeft size={15} /> Back to NEXA</button>
    </div>
  );
}

/* ============================================================================
   ROOT
============================================================================ */

export default function NexaLanding() {
  const [view, setView] = useState("home");
  const [nexaOpen, setNexaOpen] = useState(false);

  const navigate = useCallback((dest) => {
    setView(dest);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div id="nexa-landing" style={{ minHeight: "100%" }}>
      <style>{TOKENS_CSS}</style>
      <NavBar onNavigate={navigate} onStartNexa={() => setNexaOpen(true)} />

      {view === "home" ? (
        <>
          <HeroScene onNavigate={navigate} onStartNexa={() => setNexaOpen(true)} />
          <ProblemSection />
          <PillarsSection onNavigate={navigate} />
          <NexaIntelligenceSection />
          <WomenSection onNavigate={navigate} />
          <RoadmapSection onNavigate={navigate} />
          <FinalCTASection onStartNexa={() => setNexaOpen(true)} onNavigate={navigate} />
        </>
      ) : (
        <PlaceholderRoute route={view} onBack={() => navigate("home")} />
      )}

      <Footer onNavigate={navigate} />
      <NexaDrawer open={nexaOpen} onClose={() => setNexaOpen(false)} />
    </div>
  );
}
