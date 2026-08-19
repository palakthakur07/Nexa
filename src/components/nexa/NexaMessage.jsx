import { Sparkles } from "lucide-react";
import { renderMarkdownLite } from "../../lib/markdownLite.jsx";
import ActionCard from "./ActionCard.jsx";

export default function NexaMessage({ content, actions, onRunAction }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--accent-strong)" }}>
        <Sparkles size={13} color="#fff" />
      </div>
      <div className="max-w-[85%] rounded-[var(--radius-md)] rounded-tl-sm px-4 py-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {renderMarkdownLite(content)}
        {actions && actions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {actions.map((a, i) => <ActionCard key={i} action={a} onRun={onRunAction} />)}
          </div>
        )}
      </div>
    </div>
  );
}
