import { useNavigate } from "react-router-dom";
import { Sparkles, Compass, Map, TrendingUp } from "lucide-react";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import LaptopFrame from "../ui/LaptopFrame.jsx";
import ParticlesBg from "../ui/ParticlesBg.jsx";
import NexaScreenPreview from "./NexaScreenPreview.jsx";
import { Reveal, useCameraParallax } from "../../lib/hooks.jsx";

// Laptop-mockup hero — a deliberate direction change from the earlier
// floating-3D-screens composition (see FloatingScreen.jsx / screens.config.jsx,
// now removed). Screen content is real NEXA UI rendered as an HTML overlay
// (NexaScreenPreview), not a stock photo, inside a hand-built laptop chrome
// (LaptopFrame) themed to the brand's own graphite/accent palette rather
// than a generic gray-plastic stock SVG.
const FEATURES = [
  { icon: Compass, title: "Personalized Opportunities", desc: "Matched to your goals, skills & interests." },
  { icon: Map, title: "Guided Roadmap", desc: "A step-by-step plan built just for you." },
  { icon: Sparkles, title: "AI-Powered Support", desc: "Ask NEXA anything. Anytime." },
  { icon: TrendingUp, title: "Progress Tracking", desc: "See your milestones and celebrate wins." },
];

export default function HeroScene() {
  const navigate = useNavigate();
  const cameraRef = useCameraParallax(4);

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
          <Reveal>
            <Badge tone="neutral"><Sparkles size={12} className="anim-spin-slow" style={{ animationDuration: "5s" }} /> Your journey, your guide</Badge>
          </Reveal>
          <Reveal delay={60}>
            <div className="font-display mt-6 text-[13px] font-semibold" style={{ color: "var(--accent-strong)", letterSpacing: "0.35em" }}>NEXA</div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-display mt-3 text-[2.5rem] leading-[1.1] md:text-[3.4rem]">
              Find what's next.<br />
              With{" "}
              <span className="hero-gradient-text" style={{ backgroundImage: "linear-gradient(100deg, var(--accent-strong), var(--accent))" }}>
                NEXA
              </span>{" "}
              by your side.
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Discover opportunities, follow a roadmap built around your goals, and turn a plan into action — all in one place.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="hero-cta-glow relative inline-flex">
                <Button variant="primary" size="lg" icon={Sparkles} onClick={() => navigate("/onboarding")}>Start with NEXA</Button>
              </span>
              <a href="#problem"><Button variant="secondary" size="lg">Explore</Button></a>
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div className="hero-feature-row mt-11 grid grid-cols-2 gap-x-2 gap-y-7 rounded-[var(--radius-lg)] sm:grid-cols-4 sm:gap-x-1">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="hero-feature t-standard relative px-3 py-1 first:pl-0">
                  {i > 0 && <span className="hero-feature-divider hidden sm:block" aria-hidden="true" />}
                  <div className="hero-feature-icon t-standard flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}>
                    <f.icon size={18} />
                  </div>
                  <div className="mt-3 text-[13px] font-semibold leading-snug">{f.title}</div>
                  <div className="mt-1 text-[11.5px] leading-snug" style={{ color: "var(--text-secondary)" }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right: laptop mockup — sits in a perspective stage so it tilts
            subtly toward the cursor (desktop, motion allowed), with a warm
            layered glow and a soft grounding shadow beneath it for depth. */}
        <Reveal delay={140}>
          <div className="hero-stage relative mx-auto w-full max-w-xl">
            <div aria-hidden="true" className="hero-laptop-glow pointer-events-none absolute inset-0" />
            <div className="hero-idle relative">
              <div ref={cameraRef} className="hero-camera relative">
                <LaptopFrame>
                  <NexaScreenPreview />
                </LaptopFrame>
              </div>
            </div>
            <div aria-hidden="true" className="hero-laptop-shadow" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}