import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Chip from "../components/ui/Chip.jsx";
import SelectCard from "../components/ui/SelectCard.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { CAREER_STAGES, INTERESTS, GOALS, SKILL_SUGGESTIONS, PRIORITIES } from "../data/onboardingOptions.js";

export default function Profile() {
  const { profile, setProfile } = useProfile();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const update = (patch) => setProfile((p) => ({ ...p, ...patch }));
  const toggleIn = (field, val) => setProfile((p) => ({ ...p, [field]: p[field].includes(val) ? p[field].filter((v) => v !== val) : [...p[field], val] }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <button onClick={() => navigate("/dashboard")} className="t-fast inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft size={14} /> Back to dashboard
      </button>
      <h1 className="font-display mt-4 text-[2.2rem]">Your profile</h1>
      <p className="mt-1 text-[14px]" style={{ color: "var(--text-secondary)" }}>This is what NEXA uses to personalize your dashboard.</p>

      <div className="mt-8 space-y-8">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Personal</div>
          <div className="nexa-card mt-2 rounded-[var(--radius-md)] p-4">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>First name</label>
            <input value={profile.name} onChange={(e) => update({ name: e.target.value })} className="mt-1.5 w-full border-0 bg-transparent text-[15px] outline-none" />
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Career</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CAREER_STAGES.map((o) => <SelectCard key={o} label={o} selected={profile.careerStage === o} onClick={() => update({ careerStage: o })} />)}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Interests</div>
          <div className="mt-2 flex flex-wrap gap-2">{INTERESTS.map((o) => <Chip key={o} selected={profile.interests.includes(o)} onClick={() => toggleIn("interests", o)}>{o}</Chip>)}</div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Goals</div>
          <div className="mt-2 flex flex-wrap gap-2">{GOALS.map((o) => <Chip key={o} selected={profile.goals.includes(o)} onClick={() => toggleIn("goals", o)}>{o}</Chip>)}</div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Skills</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...new Set([...SKILL_SUGGESTIONS, ...profile.skills])].map((o) => <Chip key={o} selected={profile.skills.includes(o)} onClick={() => toggleIn("skills", o)}>{o}</Chip>)}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Priorities</div>
          <div className="mt-2 flex flex-wrap gap-2">{PRIORITIES.map((o) => <Chip key={o} selected={profile.priorities.includes(o)} onClick={() => toggleIn("priorities", o)}>{o}</Chip>)}</div>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-3">
        <Button variant="primary" onClick={save}>Save changes</Button>
        {saved && <span className="text-[13px] font-medium" style={{ color: "var(--success)" }}>Profile updated.</span>}
      </div>
    </div>
  );
}
