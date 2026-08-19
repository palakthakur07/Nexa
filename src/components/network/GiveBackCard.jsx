import { useState } from "react";
import { Check, X } from "lucide-react";
import Button from "../ui/Button.jsx";
import Chip from "../ui/Chip.jsx";
import { HELP_TYPES } from "../../data/networkOptions.js";
import { useProfile } from "../../context/ProfileContext.jsx";

const HOW_TO_HELP = ["Quick questions", "Mentorship", "Application feedback", "Career advice"];

function GiveBackForm({ onClose }) {
  const { profile, setProfile } = useProfile();
  const [experience, setExperience] = useState("");
  const [canHelp, setCanHelp] = useState([]);
  const [howToHelp, setHowToHelp] = useState([]);

  const toggle = (list, setList, val) => setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);

  const submit = () => {
    setProfile((p) => ({ ...p, giveBack: { experience, canHelp, howToHelp, submittedAt: new Date().toISOString() } }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/20 p-4 md:items-center" style={{ backdropFilter: "blur(2px)" }} onClick={onClose}>
      <div className="anim-drawer nexa-panel w-full max-w-md rounded-[var(--radius-xl)] p-7" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="text-[15px] font-semibold">Share your experience</div>
          <button onClick={onClose} aria-label="Close" className="t-fast rounded-full p-1.5 hover:bg-[var(--surface-muted)]"><X size={18} /></button>
        </div>
        <div className="mt-5 space-y-5">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>What have you experienced?</label>
            <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={3} placeholder="e.g. Studied abroad on a scholarship, now working in AI research." className="nexa-input t-fast mt-1.5 w-full resize-none rounded-[var(--radius-md)] p-3 text-[13.5px] outline-none" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>What can you help with?</div>
            <div className="mt-2 flex flex-wrap gap-2">{HELP_TYPES.map((t) => <Chip key={t} selected={canHelp.includes(t)} onClick={() => toggle(canHelp, setCanHelp, t)}>{t}</Chip>)}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>How would you like to help?</div>
            <div className="mt-2 flex flex-wrap gap-2">{HOW_TO_HELP.map((t) => <Chip key={t} selected={howToHelp.includes(t)} onClick={() => toggle(howToHelp, setHowToHelp, t)}>{t}</Chip>)}</div>
          </div>
        </div>
        <div className="mt-6"><Button variant="primary" onClick={submit} disabled={!experience.trim()}>Save</Button></div>
      </div>
    </div>
  );
}

export default function GiveBackCard() {
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);

  if (profile.giveBack) {
    return (
      <div className="nexa-panel rounded-[var(--radius-lg)] p-5">
        <div className="flex items-center gap-2"><Check size={16} style={{ color: "var(--success)" }} /><span className="text-[13.5px] font-semibold">Thanks for sharing your experience</span></div>
        <p className="mt-1.5 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>NEXA may surface you to women exploring what you've been through.</p>
        <button onClick={() => setOpen(true)} className="t-fast mt-2 text-[12px] font-semibold" style={{ color: "var(--accent-strong)" }}>Edit</button>
        {open && <GiveBackForm onClose={() => setOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="nexa-panel rounded-[var(--radius-lg)] p-5">
      <div className="font-display text-[1.2rem]">Want to help someone who's where you once were?</div>
      <p className="mt-1.5 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>Share a little about your journey so NEXA can connect you to someone who needs it.</p>
      <div className="mt-3"><Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Share your experience</Button></div>
      {open && <GiveBackForm onClose={() => setOpen(false)} />}
    </div>
  );
}
