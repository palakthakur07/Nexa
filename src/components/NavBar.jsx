import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import Button from "./ui/Button.jsx";
import Avatar from "./ui/Avatar.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function NavBar() {
  const { profile } = useProfile();
  const { isAuthenticated, configured, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const inProduct = location.pathname !== "/";
  // When Supabase is configured, "signed in" gates the product nav; offline,
  // fall back to the onboarding flag so the demo still works end to end.
  const signedIn = configured ? isAuthenticated : profile.onboardingComplete;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLink = (to, label, show = true) =>
    show && (
      <button onClick={() => navigate(to)} className="nexa-nav-link t-fast text-[13.5px] font-medium">
        {label}
      </button>
    );

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      data-scrolled={scrolled || inProduct}
      className="nexa-nav t-standard sticky top-0 z-30 flex items-center justify-between px-6 py-4 md:px-10"
    >
      <button onClick={() => navigate("/")} className="flex items-center gap-2">
        <motion.div
          whileHover={{ rotate: -8, scale: 1.08 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex items-center justify-center rounded-full font-display text-[15px]"
          style={{ width: 32, height: 32, background: "var(--accent-strong)", color: "#fff" }}
        >
          N
        </motion.div>
        <span className="font-display text-[19px]">NEXA</span>
      </button>

      <nav className="hidden items-center gap-7 md:flex">
        {navLink("/discover", "Discover", signedIn)}
        {navLink("/network", "Network", signedIn)}
        {navLink("/saved", "Saved", signedIn)}
        {navLink("/roadmap", "Roadmap", signedIn)}
        {navLink("/dashboard", "Dashboard", signedIn)}
        {navLink("/admin/opportunities", "Admin", signedIn && profile.isAdmin)}
      </nav>

      <div className="flex items-center gap-3">
        {signedIn && (
          <button onClick={() => navigate("/nexa")} aria-label="Ask NEXA" className="nexa-icon-btn t-fast flex h-9 w-9 items-center justify-center rounded-full" style={{ color: "var(--accent-strong)" }}>
            <Sparkles size={17} />
          </button>
        )}
        {signedIn && (
          <button onClick={() => navigate("/profile")} className="t-fast flex items-center gap-2" aria-label="Profile">
            <Avatar initials={(profile.name || "N")[0]} size={32} />
          </button>
        )}

        {signedIn ? (
          <button onClick={handleSignOut} aria-label="Sign out" title="Sign out" className="nexa-icon-btn t-fast flex h-9 items-center gap-1.5 rounded-full px-2" style={{ color: "var(--text-secondary)" }}>
  <LogOut size={16} />
  <span className="hidden text-[13px] font-medium sm:inline">Sign out</span>
</button>
        ) : (
          <>
            <button onClick={() => navigate("/login")} className="nexa-nav-link t-fast hidden text-[13.5px] font-medium sm:block">Sign in</button>
            <Button variant="primary" size="sm" onClick={() => navigate("/signup")}>Get started</Button>
          </>
        )}
      </div>
    </motion.header>
  );
}

