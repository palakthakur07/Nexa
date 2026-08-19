// Places a screen with a real translate3d(x, y, z) inside the preserve-3d
// hero stage, so depth comes from perspective rather than layout tricks.
export default function FloatingScreen({ cfg, onClick }) {
  const { x, y, z, rotate, scale, width, float, label, far, render } = cfg;
  const rootTransform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) rotateZ(${rotate.z}deg) scale(${scale})`;
  return (
    <button onClick={onClick} aria-label={`Open ${label}`} className="screen-3d text-left" style={{ width, zIndex: Math.round(z + 300), transform: rootTransform }}>
      <div
        className="screen-3d-float"
        style={{ "--fx": `${float.fx}px`, "--fy": `${float.fy}px`, "--fz": `${float.fz}px`, "--fr": `${float.fr}deg`, animationDuration: `${float.dur}s`, animationDelay: `${float.delay}s` }}
      >
        <div className="screen-3d-card nexa-panel rounded-[var(--radius-md)] p-3.5" style={{ opacity: far ? 0.78 : 1, filter: far ? "blur(0.5px)" : "none" }}>
          {render()}
        </div>
      </div>
    </button>
  );
}
