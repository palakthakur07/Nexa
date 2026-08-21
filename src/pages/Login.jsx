import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import AuthLayout, { AuthField, AuthError, GoogleButton, OrDivider } from "../components/auth/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { signIn, signInWithGoogle, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) { setError(error.message); return; }
    navigate(from, { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={<>New here? <Link to="/signup" style={{ color: "var(--accent-strong)", fontWeight: 600 }}>Create an account</Link></>}
    >
      {!configured && <AuthError>Supabase isn&apos;t configured yet. Add your keys to <code>.env</code> — see the README.</AuthError>}
      <GoogleButton onClick={signInWithGoogle} disabled={busy || !configured} />
      <OrDivider />
      <form onSubmit={submit}>
        <AuthError>{error}</AuthError>
        <AuthField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        <AuthField label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        <div className="mb-5 text-right">
          <Link to="/reset-password" className="text-[12.5px] font-medium" style={{ color: "var(--accent-strong)" }}>Forgot password?</Link>
        </div>
        <div className="flex justify-center">
          <Button type="submit" variant="primary" size="lg" icon={ArrowRight} iconRight disabled={busy || !configured}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

