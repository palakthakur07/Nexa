import { useNavigate } from "react-router-dom";
import { Sparkles, Compass, Map, TrendingUp } from "lucide-react";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import MacbookPro from "../ui/MacbookPro.jsx";
import ParticlesBg from "../ui/ParticlesBg.jsx";
import NexaScreenPreview from "./NexaScreenPreview.jsx";
import { Reveal } from "../../lib/hooks.jsx";

// Laptop-mockup hero — a deliberate direction change from the earlier
// floating-3D-screens composition (see FloatingScreen.jsx / screens.config.jsx,
// now removed). Screen content is real NEXA UI rendered as an HTML overlay
// (NexaScreenPreview), not a stock photo, positioned with percentages
// matched to MacbookPro's screen cutout so it stays aligned at any size.
const FEATURES = [
  { icon: Compass, title: "Personalized Opportunities", desc: "Matched to your goals, skills & interests." },
  { icon: Map, title: "Guided Roadmap", desc: "A step-by-step plan built just for you." },
  { icon: Sparkles, title: "AI-Powered Support", desc: "Ask NEXA anything. Anytime." },
  { icon: TrendingUp, title: "Progress Tracking", desc: "See your milestones and celebrate wins." },
];

export default function HeroScene() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 md:px-10 md:pt-16">
      <ParticlesBg />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-10%] h-[560px] w-[700px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(201,123,134,0.13), rgba(201,123,134,0))" }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: message */}
        <div>
          <Reveal><Badge tone="neutral"><Sparkles size={12} /> Your journey, your guide</Badge></Reveal>
          <Reveal delay={60}>
            <div className="font-display mt-6 text-[13px] font-semibold" style={{ color: "var(--accent-strong)", letterSpacing: "0.35em" }}>NEXA</div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-display mt-3 text-[2.5rem] leading-[1.1] md:text-[3.2rem]">
              Find what's next.<br />
              With <span style={{ color: "var(--accent-strong)" }}>NEXA</span> by your side.
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Discover opportunities, follow a roadmap built around your goals, and turn a plan into action — all in one place.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" icon={Sparkles} onClick={() => navigate("/onboarding")}>Start with NEXA</Button>
              <a href="#problem"><Button variant="secondary" size="lg">Explore</Button></a>
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-11 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}>
                    <f.icon size={18} />
                  </div>
                  <div className="mt-3 text-[13px] font-semibold leading-snug">{f.title}</div>
                  <div className="mt-1 text-[11.5px] leading-snug" style={{ color: "var(--text-secondary)" }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right: laptop mockup */}
        <Reveal delay={140}>
          <div className="relative mx-auto w-full max-w-xl">
            <MacbookPro style={{ color: "var(--surface)", width: "100%", height: "auto" }} />
            <div className="absolute overflow-hidden rounded-[3px]" style={{ left: "11.47%", top: "5.33%", width: "77.11%", height: "80.96%" }}>
              <NexaScreenPreview />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
