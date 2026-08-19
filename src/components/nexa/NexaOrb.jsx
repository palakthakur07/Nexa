// Abstract intelligence visual — deliberately not a robot head, cartoon,
// or human avatar. A soft layered radial form in the existing palette.
export default function NexaOrb({ size = 96 }) {
  return (
    <div className="anim-pulse relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 96 96" width={size} height={size}>
        <circle cx="48" cy="48" r="46" fill="var(--surface-muted-strong)" opacity="0.6" />
        <circle cx="48" cy="48" r="34" fill="var(--accent-soft)" />
        <circle cx="48" cy="48" r="21" fill="var(--accent-strong)" />
        <circle cx="40" cy="40" r="6" fill="var(--surface)" opacity="0.55" />
      </svg>
    </div>
  );
}
