import HeroScene from "../components/hero/HeroScene.jsx";
import Footer from "../components/Footer.jsx";
import { ProblemSection, PillarsSection, NexaIntelligenceSection, FinalCTASection } from "../components/landing/Sections.jsx";

export default function Landing() {
  return (
    <>
      <HeroScene />
      <ProblemSection />
      <PillarsSection />
      <NexaIntelligenceSection />
      <FinalCTASection />
      <Footer />
    </>
  );
}
