// Deliberately minimal, safe formatter — no dangerouslySetInnerHTML, no
// arbitrary HTML. Supports **bold**, "- " bullets, "1. " numbered lines,
// and blank-line paragraph breaks, which is all NEXA's responses use.
export function renderMarkdownLite(text) {
  if (!text) return null;
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, bi) => {
    const lines = block.split("\n").filter((l) => l.trim().length > 0);
    const isBulletBlock = lines.length > 0 && lines.every((l) => /^[-•]\s+/.test(l.trim()));
    const isNumberedBlock = lines.length > 0 && lines.every((l) => /^\d+\.\s+/.test(l.trim()));

    if (isBulletBlock) {
      return (
        <ul key={bi} className="my-1.5 list-disc space-y-1 pl-5">
          {lines.map((l, li) => <li key={li} className="text-[13.5px] leading-relaxed">{renderInline(l.replace(/^[-•]\s+/, ""))}</li>)}
        </ul>
      );
    }
    if (isNumberedBlock) {
      return (
        <ol key={bi} className="my-1.5 list-decimal space-y-1 pl-5">
          {lines.map((l, li) => <li key={li} className="text-[13.5px] leading-relaxed">{renderInline(l.replace(/^\d+\.\s+/, ""))}</li>)}
        </ol>
      );
    }
    return (
      <p key={bi} className="text-[13.5px] leading-relaxed" style={{ marginTop: bi > 0 ? 8 : 0 }}>
        {lines.map((l, li) => <span key={li}>{renderInline(l)}{li < lines.length - 1 && <br />}</span>)}
      </p>
    );
  });
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <b key={i}>{part.slice(2, -2)}</b>;
    return <span key={i}>{part}</span>;
  });
}
