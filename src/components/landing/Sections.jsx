import { useNavigate } from "react-router-dom";
import { Sparkles, Compass, Users, MapPin, ArrowRight, ChevronRight, GraduationCap, DollarSign, Globe, Award, RotateCcw, Wrench } from "lucide-react";
import Button from "../ui/Button.jsx";
import { Reveal, useReveal } from "../../lib/hooks.jsx";
import { useState } from "react";

const scatterWords = [
  { label: "Scholarship", icon: GraduationCap },
  { label: "Mentor", icon: Users },
  { label: "Grant", icon: DollarSign },
  { label: "Community", icon: Globe },
  { label: "Fellowship", icon: Award },
  { label: "Returnship", icon: RotateCcw },
  { label: "Workshop", icon: Wrench },
];

export function ProblemSection() {
  const [ref, inView] = useReveal();
  return (
    <section id="problem" className="relative overflow-hidden px-6 py-28 md:px-10" ref={ref}>
      <style>{`
        @keyframes nexaPillIn {
          from { opacity: 0; transform: translateY(16px) scale(0.9) rotate(var(--rot, 0deg)); }
          to { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
        @keyframes nexaProblemBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      `}</style>

      {/* Decorative depth — soft twin glows behind the whole section */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(201,123,134,0.16), rgba(201,123,134,0))" }} />

      <div className="relative mx-auto max-w-2xl text-center">
        <Reveal>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--accent-strong)" }}>
            <span style={{ width: 16, height: 1.5, background: "var(--accent-strong)" }} /> The problem <span style={{ width: 16, height: 1.5, background: "var(--accent-strong)" }} />
          </div>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="font-display mt-4 text-[2.2rem] leading-[1.12] md:text-[3rem]">
            Your next opportunity shouldn't depend on <span style={{ color: "var(--accent-strong)" }}>knowing where to look.</span>
          </h2>
        </Reveal>
      </div>

      {/* Pill cloud — sits in normal flow (flex-wrap) so labels of any width
          never overlap. The "scatter" feel comes purely from a per-item
          transform/opacity entrance, which doesn't affect layout position. */}
      <div className="relative mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-center gap-3">
        {scatterWords.map((w, i) => {
          const filled = i % 3 === 1;
          const rot = [-7, 5, -4, 6, -5, 4, -6][i % 7];
          return (
            <span
              key={w.label}
              className="nexa-pill inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-[13.5px] font-semibold"
              style={{
                background: filled ? "var(--accent-strong)" : "var(--surface)",
                color: filled ? "#fff" : "var(--text-primary)",
                border: filled ? "1px solid var(--accent-strong)" : "1px solid var(--border)",
                boxShadow: filled ? "0 8px 20px rgba(140,75,87,0.28)" : "var(--shadow-md)",
                "--rot": `${rot}deg`,
                opacity: inView ? 1 : 0,
                animation: inView
                  ? `nexaPillIn 640ms var(--ease-spring) ${i * 90}ms both, nexaProblemBob ${2.6 + (i % 3) * 0.4}s ease-in-out ${1.4 + i * 0.12}s infinite`
                  : "none",
              }}
            >
              <w.icon size={13} style={{ opacity: filled ? 1 : 0.7 }} />
              {w.label}
            </span>
          );
        })}
      </div>

      <Reveal delay={120}>
        <p className="font-display relative mx-auto mt-14 max-w-lg text-center text-[1.35rem] leading-snug">
          NEXA gathers them into <span style={{ color: "var(--accent-strong)" }}>one place</span> — matched to you, not just searchable.
        </p>
      </Reveal>
    </section>
  );
}

const pillars = [
  { key: "discover", label: "Discover", icon: Compass, copy: "Opportunities matched to you — scholarships, fellowships, grants and roles worth your time.", route: "/discover" },
  { key: "connect", label: "Connect", icon: Users, copy: "Women who've already walked the path you're considering, ready to talk it through.", route: "/network" },
  { key: "plan", label: "Plan", icon: MapPin, copy: "A roadmap built around your goal, broken into steps that actually make sense.", route: "/roadmap" },
  { key: "move", label: "Move", icon: ArrowRight, copy: "A clear next action — never a vague list of things you should probably do.", route: "/discover" },
];

export function PillarsSection() {
  const navigate = useNavigate();
  const [active, setActive] = useState("discover");
  const current = pillars.find((p) => p.key === active);
  return (
    <section id="how-it-works" className="px-6 py-24 md:px-10" style={{ background: "var(--surface-muted)" }}>
      <Reveal><div className="mx-auto mb-14 max-w-xl text-center"><div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>What NEXA connects</div><h2 className="font-display mt-3 text-[2rem] md:text-[2.5rem]">Four ideas, one path forward.</h2></div></Reveal>
      <Reveal delay={100}>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[240px_1fr] md:gap-10">
          <div className="flex flex-row gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1.5 md:overflow-visible md:pb-0">
            {pillars.map((p) => (
              <button
                key={p.key}
                data-active={active === p.key}
                onClick={() => setActive(p.key)}
                className="pillar-tab t-fast flex shrink-0 items-center gap-2.5 rounded-[var(--radius-md)] px-4 py-3 text-left text-[14px] font-semibold md:px-4"
              >
                <span className="pillar-tab-icon t-fast flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <p.icon size={15} />
                </span>
                {p.label}
              </button>
            ))}
          </div>
          <div key={active} className="nexa-card anim-fadeup rounded-[var(--radius-lg)] p-8 md:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--accent-soft)" }}>
              <current.icon size={22} style={{ color: "var(--accent-strong)" }} />
            </div>
            <div className="font-display mt-5 text-[1.6rem]">{current.label}</div>
            <p className="mt-2 max-w-md text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{current.copy}</p>
            <button onClick={() => navigate(current.route)} className="pillar-cta t-fast mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>
              Explore {current.label.toLowerCase()} <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function NexaIntelligenceSection() {
  const [panelRef, panelInView] = useReveal();
  const stats = [{ n: "7", l: "opportunities" }, { n: "3", l: "funding options" }, { n: "2", l: "women to connect with" }, { n: "1", l: "suggested next step" }];
  return (
    <section className="relative overflow-hidden px-6 py-28 md:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(201,123,134,0.14), rgba(201,123,134,0))" }} />

      <div className="relative mx-auto grid max-w-5xl items-center gap-14 md:grid-cols-2">
        <Reveal>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--accent-strong)" }}>
            <span style={{ width: 16, height: 1.5, background: "var(--accent-strong)" }} /> Nexa intelligence
          </div>
          <h2 className="font-display mt-4 text-[2.1rem] leading-[1.14] md:text-[2.7rem]">
            Not another <span className="hero-gradient-text" style={{ backgroundImage: "linear-gradient(100deg, var(--accent-strong), var(--accent))" }}>chatbot.</span>
          </h2>
          <p className="mt-5 max-w-md text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>Nexa turns scattered possibilities into a path forward — matched opportunities, people who can help, and a next step, in one place.</p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            <span className="anim-pulse h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} /> Preview shown with sample data
          </div>
        </Reveal>

        <div ref={panelRef} className="relative">
          <div aria-hidden="true" className="nexa-chat-glow pointer-events-none absolute -inset-6" />
          <div className="nexa-panel nexa-chat-panel relative rounded-[var(--radius-xl)] p-6">
            <div
              className={`flex justify-end ${panelInView ? "anim-fadeup" : ""}`}
              style={{ opacity: panelInView ? undefined : 0, animationDelay: panelInView ? "80ms" : undefined }}
            >
              <div className="max-w-[80%] rounded-[var(--radius-md)] rounded-tr-sm px-4 py-2.5 text-[13.5px]" style={{ background: "var(--surface-muted)" }}>I want to study AI abroad but I don't have much money.</div>
            </div>
            <div
              className={`mt-3 flex items-start gap-2 ${panelInView ? "anim-fadeup" : ""}`}
              style={{ opacity: panelInView ? undefined : 0, animationDelay: panelInView ? "420ms" : undefined }}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--accent-strong)" }}><Sparkles size={13} color="#fff" /></div>
              <div className="max-w-[80%] rounded-[var(--radius-md)] rounded-tl-sm px-4 py-2.5 text-[13.5px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>I can work with that.</div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {stats.map((s, i) => (
                <div
                  key={s.l}
                  className={`nexa-stat-tile t-standard rounded-[var(--radius-md)] p-3.5 text-center ${panelInView ? "anim-popup" : ""}`}
                  style={{ background: "var(--surface-muted)", opacity: panelInView ? undefined : 0, animationDelay: panelInView ? `${640 + i * 90}ms` : undefined }}
                >
                  <div className="font-display text-[1.5rem]">{s.n}</div><div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCTASection() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden px-6 py-28 text-center md:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(201,123,134,0.16), rgba(201,123,134,0))" }} />
      <Reveal>
        <div className="relative inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--accent-strong)" }}>
          <span style={{ width: 16, height: 1.5, background: "var(--accent-strong)" }} /> Ready when you are <span style={{ width: 16, height: 1.5, background: "var(--accent-strong)" }} />
        </div>
        <h2 className="font-display relative mx-auto mt-5 max-w-xl text-[2.3rem] leading-tight md:text-[3.1rem]">
          Your next move is <span className="hero-gradient-text" style={{ backgroundImage: "linear-gradient(100deg, var(--accent-strong), var(--accent))" }}>closer</span> than you think.
        </h2>
        <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
          <span className="hero-cta-glow relative inline-flex">
            <Button variant="primary" size="lg" icon={Sparkles} onClick={() => navigate("/onboarding")}>Start with Nexa</Button>
          </span>
          <Button variant="secondary" size="lg" onClick={() => navigate("/discover")}>Explore opportunities</Button>
        </div>
      </Reveal>
    </section>
  );
}