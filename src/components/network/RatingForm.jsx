import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function RatingForm({ request, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from('mentor_reviews').insert({
        request_id: request.id,
        mentor_id: request.mentor_id,
        reviewer_id: request.mentee_id,
        rating: parseInt(rating, 10),
        comment,
      });

      if (error) throw error;
      onSubmitted();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-stone-900 border rounded-2xl max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold">Rate Mentorship Experience</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Rating (1 to 5 Stars)</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full p-2 border rounded-xl bg-stone-50 dark:bg-stone-800"
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terribly Disappointing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Written Review (Optional)</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded-xl bg-stone-50 dark:bg-stone-800"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              type="submit"
              className="px-4 py-2 bg-pink-600 text-white text-xs font-semibold rounded-xl"
            >
              {submitting ? 'Saving...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}