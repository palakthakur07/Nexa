import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Chip from "../components/ui/Chip.jsx";
import SelectCard from "../components/ui/SelectCard.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { syncMentorPhoto } from "../lib/dataService.js";
import { CAREER_STAGES, INTERESTS, GOALS, SKILL_SUGGESTIONS, PRIORITIES } from "../data/onboardingOptions.js";
import { HELP_TYPES } from "../data/networkOptions.js";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

export default function Profile() {
  const { profile, setProfile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  const update = (patch) => setProfile((p) => ({ ...p, ...patch }));
  const toggleIn = (field, val) => setProfile((p) => ({ ...p, [field]: p[field].includes(val) ? p[field].filter((v) => v !== val) : [...p[field], val] }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setPhotoError("");
    if (!file.type.startsWith("image/")) { setPhotoError("Please choose an image file."); return; }
    if (file.size > MAX_PHOTO_BYTES) { setPhotoError("Photo must be under 5MB."); return; }
    setPhotoUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("mentor-photos")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("mentor-photos").getPublicUrl(path);
      update({ photoUrl: data.publicUrl });
      // If this user also has a mentor listing, keep its photo in sync too.
      await syncMentorPhoto(user.id, data.publicUrl);
    } catch (err) {
      console.error("Error uploading photo:", err.message);
      setPhotoError(err.message || "Failed to upload photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const removePhoto = async () => {
    update({ photoUrl: "" });
    if (user) await syncMentorPhoto(user.id, "");
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <button onClick={() => navigate("/dashboard")} className="t-fast inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft size={14} /> Back to dashboard
      </button>
      <h1 className="font-display mt-4 text-[2.2rem]">Your profile</h1>
      <p className="mt-1 text-[14px]" style={{ color: "var(--text-secondary)" }}>This is what NEXA uses to personalize your dashboard.</p>

      <div className="mt-8 space-y-8">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Photo</div>
          <div className="nexa-card mt-2 rounded-[var(--radius-md)] p-4 flex items-center gap-4">
            <Avatar initials={(profile.name || "?")[0]?.toUpperCase()} photoUrl={profile.photoUrl} size={56} />
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="px-3.5 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50"
                style={{ border: "1px solid var(--border-strong)" }}
              >
                {photoUploading ? "Uploading…" : profile.photoUrl ? "Change photo" : "Upload photo"}
              </button>
              {profile.photoUrl && (
                <button type="button" onClick={removePhoto} className="ml-2 px-3 py-2 rounded-xl text-xs font-medium transition" style={{ color: "var(--text-secondary)" }}>
                  Remove
                </button>
              )}
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                JPG or PNG, up to 5MB. If you're also a mentor, this photo is used on your mentor listing too.
              </p>
              {photoError && <p className="text-xs mt-1" style={{ color: "var(--danger, #b91c1c)" }}>{photoError}</p>}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Personal</div>
          <div className="nexa-card mt-2 rounded-[var(--radius-md)] p-4">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>First name</label>
            <input value={profile.name} onChange={(e) => update({ name: e.target.value })} className="mt-1.5 w-full border-0 bg-transparent text-[15px] outline-none" />
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>Location</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="nexa-card rounded-[var(--radius-md)] p-4">
              <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Country</label>
              <input
                value={profile.location.country}
                onChange={(e) => update({ location: { ...profile.location, country: e.target.value } })}
                placeholder="e.g. India"
                className="mt-1.5 w-full border-0 bg-transparent text-[15px] outline-none"
              />
            </div>
            <div className="nexa-card rounded-[var(--radius-md)] p-4">
              <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>City</label>
              <input
                value={profile.location.city}
                onChange={(e) => update({ location: { ...profile.location, city: e.target.value } })}
                placeholder="e.g. Bengaluru"
                className="mt-1.5 w-full border-0 bg-transparent text-[15px] outline-none"
              />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>Willing to explore opportunities elsewhere?</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Yes", "No", "Online only"].map((o) => (
                <Chip key={o} selected={profile.location.openToRelocation === o} onClick={() => update({ location: { ...profile.location, openToRelocation: o } })}>{o}</Chip>
              ))}
            </div>
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

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>What I can help with</div>
          <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>Optional — lets NEXA eventually suggest you to women exploring what you've already been through.</p>
          <div className="mt-2 flex flex-wrap gap-2">{HELP_TYPES.map((o) => <Chip key={o} selected={profile.helpTopics.includes(o)} onClick={() => toggleIn("helpTopics", o)}>{o}</Chip>)}</div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={save}>Save changes</Button>
        {saved && <span className="text-[13px] font-medium" style={{ color: "var(--success)" }}>Profile updated.</span>}
        <Button variant="ghost" icon={Sparkles} onClick={() => navigate("/nexa", { state: { entryContext: { type: "profile" } } })}>Ask NEXA about my next step</Button>
      </div>
    </div>
  );
}