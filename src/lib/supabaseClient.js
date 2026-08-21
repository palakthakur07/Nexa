// The single Supabase client for the whole app. Configuration comes from
// Vite env vars (see .env.example). If they're missing, `supabase` is null
// and `isSupabaseConfigured()` returns false — the app then runs in the
// original local/demo mode so it never hard-crashes without a backend.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env?.VITE_SUPABASE_URL;
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => Boolean(url && anonKey);

export const supabase = isSupabaseConfigured()
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

