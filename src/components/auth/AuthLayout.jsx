import { motion } from "framer-motion";

// Shared shell for the auth screens — centered card on the warm brand
// background, with a subtle entrance animation.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="nexa-panel w-full max-w-[420px] rounded-[var(--radius-xl)] p-8 md:p-10"
      >
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full font-display text-[17px]" style={{ background: "var(--accent-strong)", color: "#fff" }}>N</div>
          <h1 className="font-display text-[1.7rem]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-[13px]" style={{ color: "var(--text-secondary)" }}>{footer}</div>}
      </motion.div>
    </div>
  );
}

export function AuthField({ label, ...props }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <input
        {...props}
        className="nexa-ai-input t-fast w-full rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] outline-none"
      />
    </label>
  );
}

export function AuthError({ children }) {
  if (!children) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-4 rounded-[var(--radius-md)] px-4 py-2.5 text-[13px]"
      style={{ background: "var(--surface-muted)", color: "var(--accent-strong)", border: "1px solid var(--accent-soft)" }}
    >
      {children}
    </motion.div>
  );
}

export function AuthNotice({ children }) {
  if (!children) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-4 rounded-[var(--radius-md)] px-4 py-2.5 text-[13px]"
      style={{ background: "var(--success-soft)", color: "var(--success)", border: "1px solid var(--success-soft)" }}
    >
      {children}
    </motion.div>
  );
}

export function GoogleButton({ onClick, disabled, label = "Continue with Google" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="nexa-btn-secondary t-spring mb-4 flex w-full items-center justify-center gap-2.5 rounded-full px-5 py-2.5 text-[14px] font-semibold"
    >
      <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      {label}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      <span className="text-[11.5px] font-medium" style={{ color: "var(--text-tertiary)" }}>or</span>
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
    </div>
  );
}

