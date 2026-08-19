import { useEffect, useRef, useState } from "react";

export function useReveal() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

export function Reveal({ children, as: As = "div", className = "", delay = 0 }) {
  const [ref, inView] = useReveal();
  return (
    <As ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}>
      {children}
    </As>
  );
}

// Rotates the whole 3D hero stage a few degrees toward the cursor, so depth
// comes from real perspective rather than per-card movement. Disabled for
// touch devices and prefers-reduced-motion.
export function useCameraParallax(maxDeg = 5) {
  const cameraRef = useRef(null);
  useEffect(() => {
    const el = cameraRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = !window.matchMedia("(pointer: fine)").matches;
    if (reduce || coarse) return;
    const stage = el.closest(".hero-stage");
    let raf = null;
    const onMove = (e) => {
      const rect = stage.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `rotateY(${(nx * maxDeg).toFixed(2)}deg) rotateX(${(-ny * maxDeg * 0.6).toFixed(2)}deg)`;
      });
    };
    const onLeave = () => { el.style.transform = "rotateY(0deg) rotateX(0deg)"; };
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    return () => {
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [maxDeg]);
  return cameraRef;
}
