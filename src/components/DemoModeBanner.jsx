import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";

// Renders only when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing.
// Without this, a misconfigured deployment would silently fall back to the
// bundled sample opportunities/profile (src/data/opportunities.js,
// DEMO_PROFILE) with no indication to the visitor that they're fake — a
// real launch-blocking risk, not just a dev convenience. This makes that
// state impossible to miss or mistake for the live product.
export default function DemoModeBanner() {
  if (isSupabaseConfigured()) return null;
  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-2 px-4 py-2 text-[12.5px] font-semibold text-center"
      style={{ background: "#fef3c7", color: "#92400e", borderBottom: "1px solid #fde68a" }}
    >
      <AlertTriangle size={14} className="shrink-0" />
      Demo mode — no backend is connected. Opportunities, mentors, and accounts shown here are sample data only, not real. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to go live.
    </div>
  );
}
