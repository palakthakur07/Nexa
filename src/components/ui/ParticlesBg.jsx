import { useEffect, useRef } from "react";

// Two separate particles.js instances so density can be biased — sparse
// behind the headline/copy (left), dense behind the laptop mockup (right).
// A single full-width instance couldn't do this since particles.js has no
// per-region density option.
function initInstance(id, { number, distance, opacity }) {
  const oldCanvas = document.querySelector(`#${id} canvas`);
  if (oldCanvas) oldCanvas.remove();
  window.particlesJS(id, {
    particles: {
      number: { value: number, density: { enable: true, value_area: 800 } },
      color: { value: "#8C4B57" },
      shape: { type: "circle", stroke: { width: 0, color: "#8C4B57" } },
      opacity: { value: opacity, random: true, anim: { enable: true, speed: 0.8, opacity_min: opacity * 0.4 } },
      size: { value: 3.5, random: true, anim: { enable: true, speed: 1.5, size_min: 1 } },
      line_linked: { enable: true, distance, color: "#C97B86", opacity: opacity * 0.7, width: 1.3 },
      move: { enable: true, speed: 1.1, random: true, out_mode: "bounce" },
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false }, resize: true },
      modes: { grab: { distance: 180, line_linked: { opacity: opacity } } },
    },
    retina_detect: true,
  });
}

export default function ParticlesBg() {
  const initedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || initedRef.current) return;

    const initParticles = () => {
      if (window.pJSDom?.length > 0) {
        window.pJSDom.forEach((p) => p.pJS.fn.vendors.destroypJS());
        window.pJSDom = [];
      }
      // Sparse, faint field behind the text column.
      initInstance("nexa-particles-text", { number: 16, distance: 130, opacity: 0.22 });
      // Denser, more visible field behind the laptop mockup.
      initInstance("nexa-particles-laptop", { number: 80, distance: 150, opacity: 0.65 });
    };

    let script = document.querySelector('script[data-nexa-particles]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
      script.async = true;
      script.setAttribute("data-nexa-particles", "true");
      document.body.appendChild(script);
      script.onload = () => { initedRef.current = true; initParticles(); };
    } else if (window.particlesJS) {
      initedRef.current = true;
      initParticles();
    }

    return () => {
      if (window.pJSDom?.length > 0) {
        window.pJSDom.forEach((p) => p.pJS?.fn?.vendors?.destroypJS());
        window.pJSDom = [];
      }
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div id="nexa-particles-text" className="absolute inset-y-0 left-0" style={{ width: "42%" }} />
      <div id="nexa-particles-laptop" className="absolute inset-y-0 right-0" style={{ width: "62%" }} />
    </div>
  );
}