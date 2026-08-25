import { supabase } from '../supabaseClient';

export async function sendNexaChatMessage({ messages, userProfile }) {
  const proxyUrl = import.meta.env.VITE_NEXA_AI_PROXY_URL 
    || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nexa-chat`;

  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ messages, userProfile }),
  });

  if (!response.ok) {
    throw new Error('Failed to connect to NEXA AI service.');
  }

  const result = await response.json();
  return result.content;
}