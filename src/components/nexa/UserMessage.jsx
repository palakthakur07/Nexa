export default function UserMessage({ content }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-[var(--radius-md)] rounded-tr-sm px-4 py-2.5 text-[13.5px]" style={{ background: "var(--surface-muted)", color: "var(--text-primary)" }}>
        {content}
      </div>
    </div>
  );
}
