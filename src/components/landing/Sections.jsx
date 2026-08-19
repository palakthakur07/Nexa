import { useNavigate } from "react-router-dom";
import { Sparkles, Compass, Users, MapPin, ArrowRight, ChevronRight } from "lucide-react";
import Button from "../ui/Button.jsx";
import { Reveal, useReveal } from "../../lib/hooks.jsx";
import { useState } from "react";

const scatterWords = ["Scholarship", "Mentor", "Grant", "Community", "Fellowship", "Returnship", "Workshop"];

export function ProblemSection() {
  const [ref, inView] = useReveal();
  return (
    <section id="problem" className="px-6 py-24 md:px-10" ref={ref}>
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>The problem</div>
        <h2 className="font-display mt-3 text-[2rem] leading-tight md:text-[2.5rem]">Your next opportunity shouldn't depend on knowing where to look.</h2>
      </div>
      <div className="relative mx-auto mt-14 max-w-3xl" style={{ height: 160 }}>
        {scatterWords.map((w, i) => {
          const scattered = [{ top: "4%", left: "2%", rot: -8 }, { top: "40%", left: "18%", rot: 6 }, { top: "0%", left: "44%", rot: 4 }, { top: "55%", left: "58%", rot: -5 }, { top: "10%", left: "76%", rot: 7 }, { top: "60%", left: "8%", rot: -3 }, { top: "35%", left: "84%", rot: -6 }][i];
          return (
            <span key={w} className="t-standard absolute rounded-full px-4 py-2 text-[13px] font-medium" style={{
              background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-sm)",
              top: inView ? "50%" : scattered.top, left: inView ? `${(i / (scatterWords.length - 1)) * 88}%` : scattered.left,
              transform: inView ? "translateY(-50%) rotate(0deg)" : `rotate(${scattered.rot}deg)`, transitionDelay: `${i * 60}ms`,
            }}>{w}</span>
          );
        })}
      </div>
      <p className="mx-auto mt-10 max-w-md text-center text-[14px]" style={{ color: "var(--text-secondary)" }}>NEXA gathers them into one place — matched to you, not just searchable.</p>
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
            <button onClick={() => navigate(current.route)} className="t-fast mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>
              Explore {current.label.toLowerCase()} <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function NexaIntelligenceSection() {
  return (
    <section className="px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Nexa intelligence</div>
          <h2 className="font-display mt-3 text-[2rem] md:text-[2.4rem]">Not another chatbot.</h2>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>Nexa turns scattered possibilities into a path forward — matched opportunities, people who can help, and a next step, in one place.</p>
          <div className="mt-2 text-[12px]" style={{ color: "var(--text-tertiary)" }}>Preview shown with sample data.</div>
        </Reveal>
        <Reveal delay={120}>
          <div className="nexa-panel rounded-[var(--radius-xl)] p-6">
            <div className="flex justify-end"><div className="max-w-[80%] rounded-[var(--radius-md)] rounded-tr-sm px-4 py-2.5 text-[13.5px]" style={{ background: "var(--surface-muted)" }}>I want to study AI abroad but I don't have much money.</div></div>
            <div className="mt-3 flex items-start gap-2"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--accent-strong)" }}><Sparkles size={13} color="#fff" /></div><div className="max-w-[80%] rounded-[var(--radius-md)] rounded-tl-sm px-4 py-2.5 text-[13.5px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>I can work with that.</div></div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {[{ n: "7", l: "opportunities" }, { n: "3", l: "funding options" }, { n: "2", l: "women to connect with" }, { n: "1", l: "suggested next step" }].map((s) => (
                <div key={s.l} className="rounded-[var(--radius-md)] p-3.5 text-center" style={{ background: "var(--surface-muted)" }}>
                  <div className="font-display text-[1.5rem]">{s.n}</div><div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCTASection() {
  const navigate = useNavigate();
  return (
    <section className="px-6 py-24 text-center md:px-10">
      <Reveal>
        <h2 className="font-display mx-auto max-w-xl text-[2.2rem] leading-tight md:text-[2.8rem]">Your next move is closer than you think.</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="lg" icon={Sparkles} onClick={() => navigate("/onboarding")}>Start with Nexa</Button>
          <Button variant="secondary" size="lg" onClick={() => navigate("/discover")}>Explore opportunities</Button>
        </div>
      </Reveal>
    </section>
  );
}
