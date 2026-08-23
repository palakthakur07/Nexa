// A hand-built laptop chrome, replacing the stock community MacbookPro SVG
// (flat gray plastic, clashing highlight paths — read as clipart, not a
// product shot). This is plain HTML/CSS so it can be themed exactly to the
// brand's warm graphite instead of generic laptop-silver, and so the glow/
// shadow this project already has (hero-laptop-glow/shadow) reads as coming
// from *this* surface rather than fighting a busy SVG underneath it.
//
// children render into the screen cutout, same contract as MacbookPro's
// `src` prop but as real DOM content instead of an <image>.
export default function LaptopFrame({ children }) {
  return (
    <div className="nexa-laptop">
      <div className="nexa-laptop-lid">
        <div className="nexa-laptop-camera" aria-hidden="true" />
        <div className="nexa-laptop-screen">{children}</div>
      </div>
      <div className="nexa-laptop-base">
        <div className="nexa-laptop-hinge" aria-hidden="true" />
        <div className="nexa-laptop-notch" aria-hidden="true" />
      </div>
    </div>
  );
}