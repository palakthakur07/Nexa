import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    if (!isSupabaseConfigured()) return { error: { message: "Supabase is not configured." } };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { data, error };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured()) return { error: { message: "Supabase is not configured." } };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) return { error: { message: "Supabase is not configured." } };
    // Redirect to root, not /auth/callback: root always resolves as a real
    // static file, so Google sign-in works even before a SPA-rewrite rule
    // (vercel.json) is confirmed live. supabase-js still picks up the auth
    // token from the URL hash on load either way (detectSessionInUrl: true).
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { data, error };
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!isSupabaseConfigured()) return { error: { message: "Supabase is not configured." } };
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    return { data, error };
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (!isSupabaseConfigured()) return { error: { message: "Supabase is not configured." } };
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({
    session, user, loading,
    isAuthenticated: Boolean(user),
    configured: isSupabaseConfigured(),
    signUp, signIn, signInWithGoogle, resetPassword, updatePassword, signOut,
  }), [session, user, loading, signUp, signIn, signInWithGoogle, resetPassword, updatePassword, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}