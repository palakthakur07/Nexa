const STEPS = ["Check eligibility", "Prepare documents", "Complete application", "Submit", "Track result"];

export default function ApplicationSteps() {
  return (
    <ol className="space-y-3">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: "var(--surface-muted)", color: "var(--accent-strong)" }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-[13.5px] font-medium">{s}</span>
        </li>
      ))}
    </ol>
  );
}
