import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import AuthLayout, { AuthField, AuthError, AuthNotice, GoogleButton, OrDivider } from "../components/auth/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signUp, signInWithGoogle, configured } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setNotice("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    const { data, error } = await signUp(email, password, name);
    setBusy(false);
    if (error) { setError(error.message); return; }
    // If email confirmation is on, there's no session yet — tell the user to verify.
    if (!data.session) {
      setNotice("Almost there — check your inbox and click the verification link to activate your account.");
      return;
    }
    navigate("/onboarding", { replace: true });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building your path with NEXA."
      footer={<>Already have an account? <Link to="/login" style={{ color: "var(--accent-strong)", fontWeight: 600 }}>Sign in</Link></>}
    >
      {!configured && <AuthError>Supabase isn&apos;t configured yet. Add your keys to <code>.env</code> — see the README.</AuthError>}
      <GoogleButton onClick={signInWithGoogle} disabled={busy || !configured} label="Sign up with Google" />
      <OrDivider />
      <form onSubmit={submit}>
        <AuthError>{error}</AuthError>
        <AuthNotice>{notice}</AuthNotice>
        <AuthField label="Your name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Palak" autoComplete="name" />
        <AuthField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        <AuthField label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
        <div className="mt-2 flex justify-center">
          <Button type="submit" variant="primary" size="lg" icon={ArrowRight} iconRight disabled={busy || !configured}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

