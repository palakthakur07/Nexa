export default function Avatar({ initials, size = 40, photoUrl }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold"
      style={{ width: size, height: size, background: "var(--accent-soft)", color: "var(--accent-strong)", fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
