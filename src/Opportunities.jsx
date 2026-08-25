import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { syncWeeklyOpportunities } from './services/opportunityAutomation';

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    const LAST_SYNC = localStorage.getItem('nexa_opp_last_sync');
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    // Run web search & cleanup sync if a week has passed or on first load
    if (!LAST_SYNC || Date.now() - Number(LAST_SYNC) > ONE_WEEK_MS) {
      await syncWeeklyOpportunities();
      localStorage.setItem('nexa_opp_last_sync', Date.now().toString());
    }

    // Query active items from Supabase
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .gte('deadline', today)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching from Supabase:', error.message);
    } else {
      setOpportunities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-[var(--text-secondary)] font-medium">
        Syncing live opportunities...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search Bar & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
          More opportunities for you
        </h2>
        <div className="flex items-center gap-3">
          <div className="nexa-ai-input flex-1 sm:w-64 rounded-lg px-4 py-2 flex items-center">
            <input
              type="text"
              placeholder="Search opportunities..."
              className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
            />
          </div>
          <button className="nexa-btn-secondary px-4 py-2 rounded-lg text-sm font-medium">
            Filters
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((item) => (
          <div
            key={item.id}
            className="nexa-card p-6 rounded-2xl relative flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold tracking-wider text-[var(--text-tertiary)] uppercase">
                  {item.type}
                </span>
                <div className="w-10 h-10 rounded-full border-2 border-[var(--accent-strong)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
                  {item.match_percentage}%
                </div>
              </div>

              <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{item.organization}</p>

              {item.is_verified && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[var(--success-soft)] text-[var(--success)] font-medium">
                  ✓ Verified opportunity
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {item.tags?.map((tag) => (
                  <span key={tag} className="chip px-3 py-1 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <span>{item.category}</span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--surface-muted-strong)] text-[var(--accent-strong)] font-medium">
                  {item.days_left} days left
                </span>
              </div>
              <button className="nexa-btn-secondary px-3 py-1.5 rounded-lg text-xs font-medium">
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}