// Central character — defined asset slot. Pass `src` (a transparent
// PNG/WebP, ~300x480) once a real photo/rendered asset exists; until then
// this falls back to an art-directed illustrated placeholder.
export default function Character({ src, alt = "NEXA character visual", width = 300, height = 480 }) {
  if (src) {
    return <img src={src} alt={alt} width={width} height={height} style={{ width, height, objectFit: "contain", display: "block" }} draggable={false} />;
  }
  return (
    <svg viewBox="0 0 300 480" width={width} height={height} role="img" aria-label={alt} style={{ display: "block" }}>
      <ellipse cx="150" cy="464" rx="104" ry="13" fill="var(--surface-muted-strong)" opacity="0.5" />
      <path d="M42 464 C32 306 56 196 150 176 C244 196 268 306 258 464 Z" fill="var(--surface-muted-strong)" />
      <path d="M76 464 C71 326 87 234 150 216 C213 234 229 326 224 464 Z" fill="var(--accent-soft)" opacity="0.92" />
      <circle cx="150" cy="150" r="80" fill="var(--surface-muted-strong)" />
      <path d="M74 130 C74 76 108 42 150 42 C192 42 226 76 226 130 C226 152 219 171 209 185 C214 152 205 118 183 99 C194 118 194 139 184 152 C176 122 154 105 125 103 C140 111 148 124 148 138 C130 117 102 111 82 121 C88 156 98 177 110 187 C88 179 74 156 74 130 Z" fill="var(--accent-strong)" />
      <circle cx="150" cy="159" r="61" fill="none" stroke="var(--accent-strong)" strokeOpacity="0.16" strokeWidth="1.4" />
      <ellipse cx="123" cy="153" rx="4" ry="5.4" fill="var(--surface)" opacity="0.85" />
      <ellipse cx="174" cy="153" rx="4" ry="5.4" fill="var(--surface)" opacity="0.85" />
      <path d="M131 183 Q150 194 169 183" stroke="var(--surface)" strokeOpacity="0.5" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
