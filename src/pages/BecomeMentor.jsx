import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { fetchMyMentorProfile, createMentorProfile, updateMentorProfile, syncProfilePhoto } from "../lib/dataService.js";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

// Registers (or edits) the signed-in user's row in the REAL mentors table
// (migrations/003_mentor_network.sql), the same table CatalogContext,
// MentorDetail, and the Network page read from. A mentor here is always a
// self-registered real user — never sample/seed data.
export default function BecomeMentor() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { refreshMentors } = useCatalog();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingId, setExistingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    location: "",
    profession: "",
    industry: "",
    organization: "",
    about: "",
    topics: "",
    languages: "",
    availability: "",
  });

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    fetchMyMentorProfile(user.id).then((existing) => {
      if (existing) {
        setExistingId(existing.id);
        setPhotoUrl(existing.photoUrl || "");
        setFormData({
          name: existing.name || profile.name || "",
          headline: existing.headline || "",
          location: existing.location || "",
          profession: existing.profession || "",
          industry: existing.industry || "",
          organization: existing.organization || "",
          about: existing.about || "",
          topics: (existing.topics || []).join(", "),
          languages: (existing.languages || []).join(", "),
          availability: existing.availability || "",
        });
      } else {
        setFormData((f) => ({ ...f, name: profile.name || "" }));
        // No mentor row yet — default the photo to whatever's already on
        // their account profile so they don't have to upload it twice.
        if (profile.photoUrl) setPhotoUrl(profile.photoUrl);
      }
      setChecking(false);
    });
  }, [user, profile.name, profile.photoUrl]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file || !user) return;
    setErrorMsg("");
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrorMsg("Photo must be under 5MB.");
      return;
    }
    setPhotoUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("mentor-photos")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("mentor-photos").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
      await syncProfilePhoto(user.id, data.publicUrl);
    } catch (err) {
      console.error("Error uploading photo:", err.message);
      setErrorMsg(err.message || "Failed to upload photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!user) {
      alert("You must be logged in to register as a mentor.");
      return;
    }
    setLoading(true);
    try {
      const topicsArray = formData.topics.split(",").map((t) => t.trim()).filter(Boolean);
      const languagesArray = formData.languages.split(",").map((t) => t.trim()).filter(Boolean);
      const mentor = {
        name: formData.name,
        headline: formData.headline,
        location: formData.location,
        photoUrl: photoUrl || null,
        profession: formData.profession,
        industry: formData.industry,
        organization: formData.organization,
        about: formData.about,
        topics: topicsArray,
        canHelpWith: topicsArray,
        languages: languagesArray,
        availability: formData.availability,
        discoverable: true,
      };
      if (existingId) {
        await updateMentorProfile(existingId, mentor);
      } else {
        await createMentorProfile(user.id, mentor);
      }
      await refreshMentors();
      navigate("/network");
    } catch (err) {
      console.error("Error saving mentor profile:", err.message);
      setErrorMsg(err.message || "Failed to save mentor profile.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 rounded-full animate-spin" style={{ border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "var(--surface-muted)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="nexa-panel rounded-3xl p-8 space-y-6">
          <div>
            <h1 className="font-display text-2xl">{existingId ? "Edit your mentor profile" : "Become a mentor"}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Share your experience to support and guide other women in the NEXA network.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{errorMsg}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}
              >
                {photoUrl
                  ? <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                  : <span className="font-display text-lg">{(formData.name || "?").slice(0, 1).toUpperCase()}</span>}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50"
                  style={{ border: "1px solid var(--border-strong)" }}
                >
                  {photoUploading ? "Uploading…" : photoUrl ? "Change photo" : "Upload photo"}
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="ml-2 px-3 py-2 rounded-xl text-xs font-medium transition"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>JPG or PNG, up to 5MB.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Aditi Sharma" />
              <Field label="Headline" name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Senior Software Engineer at Google" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Profession" name="profession" required value={formData.profession} onChange={handleChange} placeholder="e.g. Software Engineer" />
              <Field label="Organization" name="organization" value={formData.organization} onChange={handleChange} placeholder="e.g. Google" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Industry" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. Technology" />
              <Field label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bengaluru, India" />
            </div>
            <Field label="Mentorship topics (comma separated)" name="topics" value={formData.topics} onChange={handleChange} placeholder="Career pivots, Leadership, Tech interviews" />
            <Field label="Languages (comma separated)" name="languages" value={formData.languages} onChange={handleChange} placeholder="English, Hindi" />
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>About</label>
              <textarea
                name="about" rows={4} value={formData.about} onChange={handleChange}
                placeholder="Tell mentees a bit about your journey and expertise..."
                className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-none nexa-ai-input"
              />
            </div>
            <Field label="Availability" name="availability" value={formData.availability} onChange={handleChange} placeholder="e.g. Alternate weekends" />

            <button
              type="submit"
              disabled={loading}
              className="nexa-btn-primary w-full py-3 font-medium rounded-xl transition disabled:opacity-50 mt-4 text-sm"
            >
              {loading ? "Saving…" : existingId ? "Save changes" : "Complete profile & join network"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
      <input type="text" {...props} className="w-full px-3.5 py-2.5 rounded-xl text-sm nexa-ai-input" />
    </div>
  );
}