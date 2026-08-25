import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function BecomeMentor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    current_role: '',
    company: '',
    field: '',
    experience_years: '',
    topics: '',
    bio: '',
    availability: '',
    linkedin_url: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      alert('You must be logged in to register as a mentor.');
      return;
    }

    setLoading(true);

    try {
      const topicsArray = formData.topics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      let formattedUrl = formData.linkedin_url.trim();
      if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const payload = {
        is_mentor: true,
        mentor_status: 'approved',
        current_role: formData.current_role,
        company: formData.company,
        field: formData.field,
        experience_years: formData.experience_years ? parseInt(formData.experience_years, 10) : 0,
        topics: topicsArray,
        bio: formData.bio,
        availability: formData.availability,
        linkedin_url: formattedUrl,
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);

      if (error) throw error;

      alert('Mentor profile saved successfully!');
      navigate('/network');
    } catch (err) {
      console.error('Error becoming mentor:', err.message);
      setErrorMsg(err.message || 'Failed to update mentor profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#fffcf8] border border-[#e8dfd5] rounded-3xl p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2d1a29]">Mentor Onboarding</h1>
            <p className="text-sm text-[#7a6a78] mt-1">
              Share your experience to support and guide other women in the NEXA network.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#4a3b47] mb-1">
                  Current Role
                </label>
                <input
                  type="text"
                  name="current_role"
                  required
                  value={formData.current_role}
                  onChange={handleChange}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3.5 py-2.5 bg-[#f5efe6] border border-[#e2d5c5] rounded-xl text-[#2d1a29] text-sm focus:outline-none focus:ring-2 focus:ring-[#802654]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4a3b47] mb-1">
                  Company/Organization
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Google"
                  className="w-full px-3.5 py-2.5 bg-[#f5efe6] border border-[#e2d5c5] rounded-xl text-[#2d1a29] text-sm focus:outline-none focus:ring-2 focus:ring-[#802654]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#4a3b47] mb-1">
                  Field
                </label>
                <input
                  type="text"
                  name="field"
                  required
                  value={formData.field}
                  onChange={handleChange}
                  placeholder="e.g. Technology"
                  className="w-full px-3.5 py-2.5 bg-[#f5efe6] border border-[#e2d5c5] rounded-xl text-[#2d1a29] text-sm focus:outline-none focus:ring-2 focus:ring-[#802654]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4a3b47] mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  className="w-full px-3.5 py-2.5 bg-[#f5efe6] border border-[#e2d5c5] rounded-xl text-[#2d1a29] text-sm focus:outline-none focus:ring-2 focus:ring-[#802654]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4a3b47] mb-1">
                Mentorship Topics (comma separated)
              </label>
              <input
                type="text"
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                placeholder="Career Pivots, Leadership, Tech"
                className="w-full px-3.5 py-2.5 bg-[#f5efe6] border border-[#e2d5c5] rounded-xl text-[#2d1a29] text-sm focus:outline-none focus:ring-2 focus:ring-[#802654]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4a3b47] mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell mentees a bit about your journey and expertise..."
                className="w-full px-3.5 py-2.5 bg-[#f5efe6] border border-[#e2d5c5] rounded-xl text-[#2d1a29] text-sm focus:outline-none focus:ring-2 focus:ring-[#802654]/40 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4a3b47] mb-1">
                Availability
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g. Alternate Weekends"
                className="w-full px-3.5 py-2.5 bg-[#f5efe6] border border-[#e2d5c5] rounded-xl text-[#2d1a29] text-sm focus:outline-none focus:ring-2 focus:ring-[#802654]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4a3b47] mb-1">
                Optional LinkedIn/Portfolio URL
              </label>
              <input
                type="text"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="www.linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 bg-[#f5efe6] border border-[#e2d5c5] rounded-xl text-[#2d1a29] text-sm focus:outline-none focus:ring-2 focus:ring-[#802654]/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#d92662] hover:bg-[#bd1c51] text-white font-medium rounded-xl transition shadow-sm disabled:opacity-50 mt-4 text-sm cursor-pointer"
            >
              {loading ? 'Updating Profile...' : 'Complete Profile & Join Network'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}