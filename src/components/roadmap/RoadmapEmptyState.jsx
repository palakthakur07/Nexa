import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import Button from "../ui/Button.jsx";
import { useProfile } from "../../context/ProfileContext.jsx";

export default function RoadmapEmptyState() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}>
        <MapPin size={24} style={{ color: "var(--accent-strong)" }} />
      </div>
      <h1 className="font-display mt-5 text-[2rem]">Let's build your roadmap.</h1>
      <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Tell NEXA what you're working toward and we'll create a personalized path for you.
      </p>
      <Button
        variant="primary"
        size="lg"
        onClick={() => navigate(profile.onboardingComplete ? "/profile" : "/onboarding")}
      >
        Build My Roadmap
      </Button>
    </div>
  );
}
