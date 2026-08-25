import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import RatingForm from '../components/network/RatingForm';

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReviewRequest, setActiveReviewRequest] = useState(null);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select(`
          *,
          mentor:mentor_id(full_name, avatar_url, current_role),
          mentee:mentee_id(full_name, avatar_url)
        `)
        .or(`mentee_id.eq.${user.id},mentor_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Mentorship Requests</h1>

      {loading ? (
        <div className="text-stone-500 py-10">Loading requests...</div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const isMentor = req.mentor_id === user.id;
            const otherUser = isMentor ? req.mentee : req.mentor;

            return (
              <div key={req.id} className="p-5 bg-white dark:bg-stone-900 border rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs uppercase tracking-wide font-semibold text-pink-600">
                      {isMentor ? 'Received Request' : 'Sent Request'}
                    </span>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                      {otherUser?.full_name}
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-stone-100 dark:bg-stone-800 rounded-full font-medium capitalize">
                    {req.status}
                  </span>
                </div>

                <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
                  <p><strong>Goal:</strong> {req.goal}</p>
                  <p><strong>Help Needed:</strong> {req.help_needed}</p>
                </div>

                <div className="pt-2 flex gap-2 justify-end">
                  {isMentor && req.status === 'requested' && (
                    <>
                      <button
                        onClick={() => updateStatus(req.id, 'accepted')}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, 'declined')}
                        className="px-3 py-1.5 bg-stone-200 dark:bg-stone-800 text-xs font-semibold rounded-lg"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      onClick={() => updateStatus(req.id, 'completed')}
                      className="px-3 py-1.5 bg-pink-600 text-white text-xs font-semibold rounded-lg"
                    >
                      Mark as Completed
                    </button>
                  )}

                  {!isMentor && req.status === 'completed' && (
                    <button
                      onClick={() => setActiveReviewRequest(req)}
                      className="px-3 py-1.5 bg-pink-100 text-pink-700 text-xs font-semibold rounded-lg"
                    >
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-stone-500">No mentorship requests found.</div>
      )}

      {activeReviewRequest && (
        <RatingForm
          request={activeReviewRequest}
          onClose={() => setActiveReviewRequest(null)}
          onSubmitted={fetchRequests}
        />
      )}
    </div>
  );
}