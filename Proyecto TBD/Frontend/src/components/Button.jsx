export default function Button({
  children,
  variant = "solid",
  className = "",
  ...props
}) {
  const base = "w-full rounded-xl font-extrabold py-3 transition active:translate-y-[1px]";
  const solid = "bg-emerald-600 hover:bg-emerald-700 text-white";
  const outline = "border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50";

  const styles = variant === "solid" ? solid : outline;

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
