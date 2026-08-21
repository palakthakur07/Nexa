import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import AuthLayout, { AuthField, AuthError } from "../components/auth/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Reached from the password-reset email link. Supabase puts a recovery
// session in place via detectSessionInUrl, so updateUser() works here.
export default function UpdatePassword() {
  const { updatePassword, configured } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) { setError(error.message); return; }
    navigate("/dashboard", { replace: true });
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a new password for your account.">
      {!configured && <AuthError>Supabase isn&apos;t configured yet. Add your keys to <code>.env</code> — see the README.</AuthError>}
      <form onSubmit={submit}>
        <AuthError>{error}</AuthError>
        <AuthField label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
        <AuthField label="Confirm password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" autoComplete="new-password" />
        <div className="mt-2 flex justify-center">
          <Button type="submit" variant="primary" size="lg" icon={ArrowRight} iconRight disabled={busy || !configured}>
            {busy ? "Saving…" : "Update password"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

