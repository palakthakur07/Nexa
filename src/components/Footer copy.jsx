import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="px-6 py-12 md:px-10" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <div className="font-display text-[17px]">NEXA</div>
          <div className="text-[12.5px]" style={{ color: "var(--text-secondary)" }}>Find what's next.</div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          <button onClick={() => navigate("/discover")} className="nexa-nav-link t-fast">Discover</button>
          <button onClick={() => navigate("/network")} className="nexa-nav-link t-fast">Network</button>
          <a href="#how-it-works" className="nexa-nav-link t-fast">How it works</a>
          <span className="nexa-nav-link">About</span>
          <span className="nexa-nav-link">Privacy</span>
          <span className="nexa-nav-link">Terms</span>
        </div>
      </div>
    </footer>
  );
}
