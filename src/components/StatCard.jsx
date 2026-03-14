export default function StatCard({
  label,
  value,
  sub,
  variant = "dark",
  delay = 0,
}) {
  const variants = {
    // Dark navy card — main CGPA card
    dark: {
      wrapper: "bg-navy text-white",
      label: "text-white/60",
      value: "text-gold",
      sub: "text-white/70",
      glow: "bg-gold/10",
    },
    // Gold card — gap / highlight stat
    gold: {
      wrapper: "bg-gold-deep text-white",
      label: "text-white/70",
      value: "text-navy",
      sub: "text-navy/70",
      glow: "bg-navy/10",
    },
    // Light card — neutral stats
    light: {
      wrapper: "bg-white border border-card-border",
      label: "text-gray-500",
      value: "text-navy",
      sub: "text-gray-400",
      glow: "bg-navy/5",
    },
  };

  const v = variants[variant];

  const animationStyle = {
    animation: `fadeUp 0.5s ease ${delay}s forwards`,
    opacity: 0,
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 shadow-card
        transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
        ${v.wrapper}`}
      style={animationStyle}
    >
      {/* Decorative background circle */}
      <div
        className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${v.glow}`}
      />

      {/* Label */}
      <p
        className={`text-xs font-heading font-semibold uppercase tracking-widest
          mb-2 relative z-10 ${v.label}`}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className={`font-heading font-extrabold text-4xl leading-none
          mb-1 relative z-10 ${v.value}`}
      >
        {value}
      </p>

      {/* Sub label */}
      {sub && (
        <p className={`text-sm font-medium relative z-10 mt-2 ${v.sub}`}>
          {sub}
        </p>
      )}
    </div>
  );
}