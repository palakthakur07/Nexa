import { Reveal } from "../../lib/hooks.jsx";

export default function DashboardSection({ eyebrow, title, action, children }) {
  return (
    <Reveal className="mb-14">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>{eyebrow}</div>
          <h2 className="font-display mt-1 text-[1.6rem]">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </Reveal>
  );
}
