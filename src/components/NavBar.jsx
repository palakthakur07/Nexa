import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "./ui/Button.jsx";
import Avatar from "./ui/Avatar.jsx";
import { useProfile } from "../context/ProfileContext.jsx";

export default function NavBar() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const inProduct = location.pathname !== "/";

  return (
    <header data-scrolled={scrolled || inProduct} className="nexa-nav t-standard sticky top-0 z-30 flex items-center justify-between px-6 py-4 md:px-10">
      <button onClick={() => navigate("/")} className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-full font-display text-[15px]" style={{ width: 32, height: 32, background: "var(--accent-strong)", color: "#fff" }}>N</div>
        <span className="font-display text-[19px]">NEXA</span>
      </button>
      <nav className="hidden items-center gap-7 md:flex">
        <button onClick={() => navigate("/discover")} className="nexa-nav-link t-fast text-[13.5px] font-medium">Discover</button>
        <button onClick={() => navigate("/network")} className="nexa-nav-link t-fast text-[13.5px] font-medium">Network</button>
        {profile.onboardingComplete && <button onClick={() => navigate("/saved")} className="nexa-nav-link t-fast text-[13.5px] font-medium">Saved</button>}
        {profile.onboardingComplete && <button onClick={() => navigate("/roadmap")} className="nexa-nav-link t-fast text-[13.5px] font-medium">Roadmap</button>}
        {profile.onboardingComplete && <button onClick={() => navigate("/dashboard")} className="nexa-nav-link t-fast text-[13.5px] font-medium">Dashboard</button>}
      </nav>
      <div className="flex items-center gap-3">
        {profile.onboardingComplete && (
          <button onClick={() => navigate("/profile")} className="t-fast flex items-center gap-2">
            <Avatar initials={(profile.name || "N")[0]} size={32} />
          </button>
        )}
        <Button variant="primary" size="sm" onClick={() => navigate(profile.onboardingComplete ? "/dashboard" : "/onboarding")}>
          {profile.onboardingComplete ? "Dashboard" : "Start with Nexa"}
        </Button>
      </div>
    </header>
  );
}
