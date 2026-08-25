import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MentorCard({ mentor }) {
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'M';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white border border-[#EFE8E2] rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        {/* Header Avatar & Details */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#F5E1E7] text-[#9E4B5E] flex items-center justify-center font-bold text-base shrink-0 border border-[#F2D7E0]">
            {getInitials(mentor.full_name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[#221C1D] text-base">
                {mentor.full_name || 'Anonymous Mentor'}
              </h3>
              {mentor.mentor_status === 'approved' && (
                <span className="bg-[#EBF7EE] text-[#2B7A41] text-[10px] font-medium px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-xs text-[#6C6264] mt-0.5">
              {mentor.current_role} {mentor.company ? `at ${mentor.company}` : ''}
            </p>
            <span className="inline-block mt-1 text-[11px] font-medium text-[#B86B7C]">
              New Mentor
            </span>
          </div>
        </div>

        {/* Bio */}
        {mentor.bio && (
          <p className="text-xs text-[#6C6264] line-clamp-2 leading-relaxed">
            {mentor.bio}
          </p>
        )}

        {/* Topics Badges */}
        {mentor.topics && mentor.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {mentor.topics.map((topic, i) => (
              <span
                key={i}
                className="bg-[#F9EBF0] text-[#9E4B5E] text-[11px] font-medium px-3 py-1 rounded-full border border-[#F2D7E0]/60"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-4 border-t border-[#EFE8E2] flex items-center justify-between text-xs text-[#6C6264]">
        <span>{mentor.experience_years ? `${mentor.experience_years} yrs exp` : 'Mentor'}</span>
        <button
          onClick={() => navigate(`/mentor/${mentor.id}`)}
          className="text-[#9E4B5E] hover:text-[#8B3D4F] font-semibold transition cursor-pointer"
        >
          View Profile →
        </button>
      </div>
    </div>
  );
}