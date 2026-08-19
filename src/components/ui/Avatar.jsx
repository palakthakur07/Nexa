export default function Avatar({ initials, size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold"
      style={{ width: size, height: size, background: "var(--accent-soft)", color: "var(--accent-strong)", fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
