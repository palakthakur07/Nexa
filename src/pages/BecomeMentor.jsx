import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { fetchMyMentorProfile, createMentorProfile, updateMentorProfile } from "../lib/dataService.js";

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

  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    location: "",
    profession: "",
    industry: "",
    organization: "",
    about: "",
    topics: "",
    availability: "",
  });

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    fetchMyMentorProfile(user.id).then((existing) => {
      if (existing) {
        setExistingId(existing.id);
        setFormData({
          name: existing.name || profile.name || "",
          headline: existing.headline || "",
          location: existing.location || "",
          profession: existing.profession || "",
          industry: existing.industry || "",
          organization: existing.organization || "",
          about: existing.about || "",
          topics: (existing.topics || []).join(", "),
          availability: existing.availability || "",
        });
      } else {
        setFormData((f) => ({ ...f, name: profile.name || "" }));
      }
      setChecking(false);
    });
  }, [user, profile.name]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
      const mentor = {
        name: formData.name,
        headline: formData.headline,
        location: formData.location,
        profession: formData.profession,
        industry: formData.industry,
        organization: formData.organization,
        about: formData.about,
        topics: topicsArray,
        canHelpWith: topicsArray,
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