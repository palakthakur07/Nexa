import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import Character from "../Character.jsx";
import FloatingScreen from "./FloatingScreen.jsx";
import { buildScreens } from "./screens.config.js";
import { Reveal, useCameraParallax } from "../../lib/hooks.jsx";
import { useNexaDrawer } from "../../context/NexaDrawerContext.jsx";

// characterSrc: pass a real character asset path once one exists, e.g.
// <HeroScene characterSrc="/images/nexa-character.png" /> — see Character.jsx.
export default function HeroScene({ characterSrc }) {
  const navigate = useNavigate();
  const { openDrawer } = useNexaDrawer();
  const cameraRef = useCameraParallax(5);

  const screens = buildScreens({
    onNavigateDiscover: () => navigate("/discover"),
    onNavigatePeople: () => navigate("/network"),
    onNavigateRoadmap: () => navigate("/roadmap"),
    onOpenNexa: openDrawer,
  });
  const background = screens.filter((s) => s.z < -100);
  const midground = screens.filter((s) => s.z >= -100 && s.z < 40);
  const foreground = screens.filter((s) => s.z >= 40);

  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-14 md:px-8 md:pt-16">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 h-[620px] w-[1000px] -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(201,123,134,0.14), rgba(201,123,134,0))" }} />

      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal><Badge tone="neutral"><Sparkles size={12} /> Your journey, your guide</Badge></Reveal>
        <Reveal delay={80}><h1 className="font-display mt-5 text-[2.6rem] leading-[1.05] md:text-[3.6rem]">Find what's next.</h1></Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Discover opportunities, meet women who've already walked the path, and turn a goal into a plan you can actually follow.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="lg" icon={Sparkles} onClick={() => navigate("/onboarding")}>Start with Nexa</Button>
            <a href="#problem"><Button variant="secondary" size="lg">Explore</Button></a>
          </div>
        </Reveal>
      </div>

      <div className="hero-stage relative mx-auto mt-8 hidden md:block" style={{ height: 620, maxWidth: 1040 }}>
        <div className="hero-idle relative h-full w-full">
          <div ref={cameraRef} className="hero-camera relative h-full w-full">
            {background.map((s) => <FloatingScreen key={s.id} cfg={s} onClick={s.onClick} />)}
            <div className="absolute left-1/2 top-1/2" style={{ transform: "translate3d(-50%, -46%, 20px)", zIndex: 320 }}>
              <Character src={characterSrc} />
            </div>
            {midground.map((s) => <FloatingScreen key={s.id} cfg={s} onClick={s.onClick} />)}
            {foreground.map((s) => <FloatingScreen key={s.id} cfg={s} onClick={s.onClick} />)}
          </div>
        </div>
      </div>

      <div className="mt-8 md:hidden">
        <div className="mx-auto flex justify-center"><Character src={characterSrc} width={220} height={352} /></div>
        <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2">
          {["opportunity", "roadmap", "people"].map((id) => {
            const s = screens.find((sc) => sc.id === id);
            return (
              <button key={id} onClick={s.onClick} className="nexa-panel shrink-0 rounded-[var(--radius-md)] p-3.5 text-left" style={{ width: 178 }}>
                {s.render()}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
