// src/services/opportunityAutomation.js
import { supabase } from '../supabaseClient';

/**
 * 1. Purge expired opportunities from Supabase
 */
export async function purgeExpiredOpportunities() {
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('opportunities')
    .delete()
    .lt('deadline', today);

  if (error) {
    console.error('Error purging expired opportunities:', error.message);
  } else {
    console.log('🧹 Expired opportunities purged.');
  }
}

/**
 * 2. Fetch live opportunities from external web APIs & save to Supabase
 */
export async function syncWeeklyOpportunities() {
  console.log('🌐 Fetching live opportunities from web sources...');

  // Always clean out old entries first
  await purgeExpiredOpportunities();

  try {
    // Fetch live opportunities from a public endpoint
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api');
    const result = await response.json();
    const rawJobs = result.data || [];

    // Map the external data to your database schema & design specs
    const freshOpportunities = rawJobs.slice(0, 6).map((item, index) => {
      // Generate a dynamic deadline (e.g., 30 to 60 days out)
      const daysLeft = 30 + (index * 5);
      const deadlineDate = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      return {
        title: item.title,
        organization: item.company_name,
        type: item.job_types?.[0]?.toUpperCase() || 'FELLOWSHIP',
        category: item.tags?.[0] || 'Technology',
        days_left: daysLeft,
        deadline: deadlineDate,
        is_verified: true,
        match_percentage: 80 + (index % 15),
        tags: item.tags?.slice(0, 3) || ['Remote', 'Tech'],
      };
    });

    // Save newly scraped opportunities into Supabase
    for (const opp of freshOpportunities) {
      await supabase
        .from('opportunities')
        .upsert(opp, { onConflict: 'title' });
    }

    console.log('✅ Successfully synced live opportunities to Supabase.');
  } catch (err) {
    console.error('Failed to fetch external web opportunities:', err);
  }
}