// The individual onboarding question types. Grouped in one file since each
// is small and they're only ever used from OnboardingFlow.
import { useState } from "react";
import { Sparkles, ArrowRight, Plus } from "lucide-react";
import Button from "../ui/Button.jsx";
import Chip from "../ui/Chip.jsx";
import SelectCard from "../ui/SelectCard.jsx";
import { SKILL_SUGGESTIONS } from "../../data/onboardingOptions.js";

export function StepHello({ name, setName, onNext, onDemo }) {
  return (
    <div className="text-center">
      <div className="anim-glow mx-auto flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "var(--accent-strong)" }}><Sparkles size={18} color="#fff" /></div>
      <h1 className="font-display mt-5 text-[2.2rem] leading-tight md:text-[2.6rem]">Let's figure out what's next.</h1>
      <p className="mx-auto mt-3 max-w-sm text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>NEXA uses a few details about where you are and where you want to go to find opportunities that actually fit you.</p>
      <div className="nexa-card mx-auto mt-7 max-w-xs rounded-[var(--radius-md)] p-4">
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>What should we call you?</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" className="mt-1.5 w-full border-0 bg-transparent text-[15px] outline-none" style={{ color: "var(--text-primary)" }} />
      </div>
      <div className="mt-7 flex flex-col items-center gap-3">
        <Button variant="primary" size="lg" icon={ArrowRight} iconRight onClick={onNext}>Let's begin</Button>
        <button onClick={onDemo} className="t-fast text-[12.5px] font-medium" style={{ color: "var(--text-tertiary)" }}>Just exploring? Load a demo profile →</button>
      </div>
    </div>
  );
}

export function StepSingleSelect({ question, sub, options, value, onChange, icons }) {
  return (
    <div>
      <h2 className="font-display text-[1.7rem] leading-snug md:text-[2rem]">{question}</h2>
      {sub && <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{sub}</p>}
      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {options.map((o) => <SelectCard key={o} label={o} icon={icons?.[o]} selected={value === o} onClick={() => onChange(o)} />)}
      </div>
    </div>
  );
}

export function StepMultiSelect({ question, sub, options, value, onChange, max }) {
  const toggle = (o) => {
    if (value.includes(o)) onChange(value.filter((v) => v !== o));
    else if (!max || value.length < max) onChange([...value, o]);
  };
  return (
    <div>
      <h2 className="font-display text-[1.7rem] leading-snug md:text-[2rem]">{question}</h2>
      <div className="mt-1.5 flex items-center gap-2">
        {sub && <p className="text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{sub}</p>}
        {max && <span className="text-[11.5px] font-semibold" style={{ color: "var(--accent-strong)" }}>{value.length}/{max} selected</span>}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {options.map((o) => <Chip key={o} selected={value.includes(o)} onClick={() => toggle(o)} disabled={max && value.length >= max && !value.includes(o)}>{o}</Chip>)}
      </div>
    </div>
  );
}

export function StepLocation({ profile, setProfile }) {
  const loc = profile.location;
  const update = (patch) => setProfile((p) => ({ ...p, location: { ...p.location, ...patch } }));
  return (
    <div>
      <h2 className="font-display text-[1.7rem] leading-snug md:text-[2rem]">Where are you based?</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="nexa-card rounded-[var(--radius-md)] p-4">
          <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Country</label>
          <input value={loc.country} onChange={(e) => update({ country: e.target.value })} placeholder="e.g. India" className="mt-1.5 w-full border-0 bg-transparent text-[14.5px] outline-none" />
        </div>
        <div className="nexa-card rounded-[var(--radius-md)] p-4">
          <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>City</label>
          <input value={loc.city} onChange={(e) => update({ city: e.target.value })} placeholder="e.g. Bengaluru" className="mt-1.5 w-full border-0 bg-transparent text-[14.5px] outline-none" />
        </div>
      </div>
      <div className="mt-5">
        <div className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>Willing to explore opportunities elsewhere?</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Yes", "No", "Online only"].map((o) => <Chip key={o} selected={loc.openToRelocation === o} onClick={() => update({ openToRelocation: o })}>{o}</Chip>)}
        </div>
      </div>
    </div>
  );
}

export function StepSkills({ value, onChange }) {
  const [custom, setCustom] = useState("");
  const toggle = (s) => onChange(value.includes(s) ? value.filter((v) => v !== s) : [...value, s]);
  const addCustom = () => { const s = custom.trim(); if (s && !value.includes(s)) onChange([...value, s]); setCustom(""); };
  return (
    <div>
      <h2 className="font-display text-[1.7rem] leading-snug md:text-[2rem]">What are you already bringing with you?</h2>
      <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>Skills for now — optional, and you can always add more later.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {SKILL_SUGGESTIONS.map((s) => <Chip key={s} selected={value.includes(s)} onClick={() => toggle(s)}>{s}</Chip>)}
        {value.filter((v) => !SKILL_SUGGESTIONS.includes(v)).map((s) => <Chip key={s} selected onClick={() => toggle(s)}>{s}</Chip>)}
      </div>
      <div className="nexa-input t-fast mt-4 flex max-w-xs items-center gap-2 rounded-full px-3.5 py-2" style={{ background: "var(--surface)", border: "1px solid var(--border-strong)" }}>
        <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()} placeholder="Add another skill" className="w-full border-0 bg-transparent text-[13px] outline-none" />
        <button onClick={addCustom} aria-label="Add skill" className="t-fast flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}><Plus size={13} /></button>
      </div>
    </div>
  );
}
