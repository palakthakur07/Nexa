import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import OnboardingLayout from "../components/onboarding/OnboardingLayout.jsx";
import { StepHello, StepSingleSelect, StepMultiSelect, StepLocation, StepSkills } from "../components/onboarding/Steps.jsx";
import { CAREER_STAGES, INTERESTS, GOALS, PRIORITIES } from "../data/onboardingOptions.js";
import { useProfile } from "../context/ProfileContext.jsx";

const STEPS = ["hello", "careerStage", "interests", "goals", "location", "skills", "priorities"];

export default function Onboarding() {
  const { profile, setProfile, loadDemo } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const total = STEPS.length;
  const key = STEPS[step];

  const complete = () => {
    setProfile((p) => ({ ...p, onboardingComplete: true }));
    navigate("/analysis");
  };
  const next = () => (step === total - 1 ? complete() : setStep((s) => s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const skip = () => next();
  const demo = () => { loadDemo(); navigate("/analysis"); };

  const canProceed = {
    hello: true,
    careerStage: !!profile.careerStage,
    interests: true,
    goals: true,
    location: true,
    skills: true,
    priorities: true,
  }[key];

  return (
    <OnboardingLayout stepIndex={step} total={total} onBack={back} onSkip={skip} canSkip={step > 0 && key !== "careerStage"}>
      {key === "hello" && <StepHello name={profile.name} setName={(name) => setProfile((p) => ({ ...p, name }))} onNext={next} onDemo={demo} />}
      {key === "careerStage" && <StepSingleSelect question="Where are you right now?" options={CAREER_STAGES} value={profile.careerStage} onChange={(v) => setProfile((p) => ({ ...p, careerStage: v }))} />}
      {key === "interests" && <StepMultiSelect question="What are you working toward?" sub="Pick up to 5." max={5} options={INTERESTS} value={profile.interests} onChange={(v) => setProfile((p) => ({ ...p, interests: v }))} />}
      {key === "goals" && <StepMultiSelect question="What would make the next year a great one?" options={GOALS} value={profile.goals} onChange={(v) => setProfile((p) => ({ ...p, goals: v }))} />}
      {key === "location" && <StepLocation profile={profile} setProfile={setProfile} />}
      {key === "skills" && <StepSkills value={profile.skills} onChange={(v) => setProfile((p) => ({ ...p, skills: v }))} />}
      {key === "priorities" && <StepMultiSelect question="What should NEXA prioritize for you?" options={PRIORITIES} value={profile.priorities} onChange={(v) => setProfile((p) => ({ ...p, priorities: v }))} />}

      {key !== "hello" && (
        <div className="mt-8 flex justify-center">
          <Button variant="primary" size="lg" icon={ArrowRight} iconRight disabled={!canProceed} onClick={next}>
            {step === total - 1 ? "See my dashboard" : "Continue"}
          </Button>
        </div>
      )}
    </OnboardingLayout>
  );
}
