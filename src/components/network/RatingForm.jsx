import React, { useState } from "react";
import { submitRating } from "../../lib/dataService.js";

// Inline "rate this mentor" card shown on MentorDetail once a connection is
// accepted. Writes to public.mentor_ratings (migrations/003_mentor_network.sql)
// via dataService.submitRating — RLS only allows this insert when the caller
// is the requester of an accepted connection_requests row for this mentor,
// so a rating can't be fabricated for an interaction that didn't happen.
export default function RatingForm({ connectionRequestId, mentorId, userId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const row = await submitRating(connectionRequestId, mentorId, userId, Number(rating), feedback || null);
      onSubmitted?.(row);
    } catch (err) {
      setError(err.message || "Could not submit rating.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="nexa-card rounded-[var(--radius-md)] p-5 space-y-3">
      <h3 className="font-display text-[1.05rem]">Rate this mentor</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Rating (1–5)</label>
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full p-2 border rounded-xl bg-stone-50 dark:bg-stone-800 text-sm">
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Very good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Disappointing</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Feedback (optional)</label>
          <textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full p-2 border rounded-xl bg-stone-50 dark:bg-stone-800 text-sm" />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button disabled={submitting} type="submit" className="px-4 py-2 bg-pink-600 text-white text-xs font-semibold rounded-xl disabled:opacity-50">
            {submitting ? "Saving…" : "Submit rating"}
          </button>
        </div>
      </form>
    </div>
  );
}
