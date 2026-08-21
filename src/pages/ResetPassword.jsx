import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import AuthLayout, { AuthField, AuthError, AuthNotice } from "../components/auth/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ResetPassword() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setNotice("");
    setBusy(true);
    const { error } = await resetPassword(email);
    setBusy(false);
    if (error) { setError(error.message); return; }
    setNotice("If an account exists for that email, a password-reset link is on its way.");
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a secure link to set a new one."
      footer={<><Link to="/login" style={{ color: "var(--accent-strong)", fontWeight: 600 }}>Back to sign in</Link></>}
    >
      {!configured && <AuthError>Supabase isn&apos;t configured yet. Add your keys to <code>.env</code> — see the README.</AuthError>}
      <form onSubmit={submit}>
        <AuthError>{error}</AuthError>
        <AuthNotice>{notice}</AuthNotice>
        <AuthField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        <div className="mt-2 flex justify-center">
          <Button type="submit" variant="primary" size="lg" icon={ArrowRight} iconRight disabled={busy || !configured}>
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

