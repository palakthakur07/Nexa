import { Check } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import MatchRing from "../ui/MatchRing.jsx";
import { isDemoMode } from "../../lib/nexaAIService.js";

function Section({ eyebrow, children }) {
  return (
    <div className="mb-6">
      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>{eyebrow}</div>
      {children}
    </div>
  );
}

// Dynamically shows whichever context is most relevant: the opportunity or
// woman the conversation opened with, otherwise the user's own profile.
export default function ContextPanel({ context }) {
  return (
    <div className="p-5">
      {isDemoMode() && (
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: "var(--surface-muted)", color: "var(--text-tertiary)" }}>
          Demo mode
        </div>
      )}

      {context.currentOpportunity ? (
        <Section eyebrow="Current focus">
          <div className="nexa-card rounded-[var(--radius-md)] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[13px] font-semibold leading-snug">{context.currentOpportunity.title}</div>
              <MatchRing value={context.currentOpportunity.match} size={32} />
            </div>
            <div className="mt-1.5 text-[11.5px]" style={{ color: "var(--text-secondary)" }}>{context.currentOpportunity.funding} · {context.currentOpportunity.categories.join(", ")}</div>
          </div>
        </Section>
      ) : context.currentWoman ? (
        <Section eyebrow="Current connection">
          <div className="nexa-card rounded-[var(--radius-md)] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[13px] font-semibold leading-snug">{context.currentWoman.name}</div>
              <MatchRing value={context.currentWoman.match} size={32} />
            </div>
            <div className="mt-1.5 text-[11.5px]" style={{ color: "var(--text-secondary)" }}>{context.currentWoman.headline}</div>
          </div>
        </Section>
      ) : null}

      <Section eyebrow="Your profile">
        {context.user.careerStage || context.user.goals.length > 0 ? (
          <div className="space-y-1.5 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>
            {context.user.careerStage && <div><b style={{ color: "var(--text-primary)" }}>Stage</b> · {context.user.careerStage}</div>}
            {context.user.interests.length > 0 && <div><b style={{ color: "var(--text-primary)" }}>Interests</b> · {context.user.interests.join(", ")}</div>}
            {context.user.goals.length > 0 && <div><b style={{ color: "var(--text-primary)" }}>Goals</b> · {context.user.goals.join(", ")}</div>}
            {context.user.priorities.length > 0 && <div><b style={{ color: "var(--text-primary)" }}>Priorities</b> · {context.user.priorities.join(", ")}</div>}
          </div>
        ) : (
          <p className="text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>Complete your profile so NEXA can personalize this.</p>
        )}
      </Section>

      <Section eyebrow="Next step">
        <div className="flex items-start gap-2 text-[12.5px]">
          <Check size={14} className="mt-0.5 shrink-0" style={{ color: "var(--success)" }} />
          <span>{context.nextMove.title}</span>
        </div>
      </Section>

      {context.savedOpportunities.length > 0 && (
        <Section eyebrow={`Saved (${context.savedOpportunities.length})`}>
          <div className="flex flex-wrap gap-1.5">{context.savedOpportunities.slice(0, 3).map((s) => <Badge key={s.id}>{s.title}</Badge>)}</div>
        </Section>
      )}
    </div>
  );
}
