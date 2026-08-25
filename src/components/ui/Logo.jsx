import logoSrc from "../../assets/logo.png";

// Single source of truth for the brand mark. Was previously a plain
// text-in-a-circle placeholder ("N" on a solid accent background) inline in
// NavBar/AuthLayout/NexaScreenPreview — replaced with the actual logo image
// everywhere at once by centralizing it here.
export default function Logo({ size = 32, rounded = false, className = "", style = {} }) {
  return (
    <img
      src={logoSrc}
      alt="NEXA"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, borderRadius: rounded ? "22%" : 0, display: "block", objectFit: "contain", ...style }}
    />
  );
}