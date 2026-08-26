function Bar({ w = "100%", h = 12, mb = 8 }) {
  return <div className="anim-pulse rounded-full" style={{ width: w, height: h, marginBottom: mb, background: "var(--surface-muted)" }} />;
}

export default function RoadmapSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14 md:px-10">
      <Bar w="140px" h={11} />
      <Bar w="60%" h={34} mb={20} />
      <div className="nexa-panel rounded-[var(--radius-lg)] p-6">
        <Bar w="30%" />
        <Bar w="100%" h={10} />
        <Bar w="40%" h={10} mb={0} />
      </div>
      <div className="mt-8 space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="anim-pulse h-9 w-9 shrink-0 rounded-full" style={{ background: "var(--surface-muted)" }} />
            <div className="flex-1">
              <Bar w="40%" h={20} />
              <Bar w="70%" h={12} />
              <div className="nexa-card mt-3 rounded-[var(--radius-lg)] p-5">
                <Bar w="80%" />
                <Bar w="60%" mb={0} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>NEXA is preparing your roadmap…</p>
    </div>
  );
}
