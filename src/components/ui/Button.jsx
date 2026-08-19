export default function Button({ children, variant = "primary", size = "md", icon: Icon, iconRight = false, onClick, disabled, type = "button" }) {
  const variantClass = { primary: "nexa-btn-primary", secondary: "nexa-btn-secondary", ghost: "nexa-btn-ghost" }[variant];
  const sizeClass = {
    sm: "text-[13px] px-3.5 py-2 gap-1.5",
    md: "text-[14px] px-5 py-2.5 gap-2",
    lg: "text-[15.5px] px-7 py-3.5 gap-2.5",
  }[size];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`t-spring inline-flex items-center justify-center rounded-full font-semibold ${variantClass} ${sizeClass}`}>
      {Icon && !iconRight && <Icon size={16} />}
      {children}
      {Icon && iconRight && <Icon size={16} />}
    </button>
  );
}
