import { AlertCircle } from "lucide-react";
import Button from "../ui/Button.jsx";

export default function RoadmapErrorState({ message, onRetry }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--warning-soft)" }}>
        <AlertCircle size={20} style={{ color: "var(--warning)" }} />
      </div>
      <p className="font-display mt-4 text-[1.3rem]">We couldn't update your roadmap right now.</p>
      <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>{message}</p>
      <Button variant="secondary" onClick={onRetry}>Try again</Button>
    </div>
  );
}
