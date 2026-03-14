export default function AlertBanner({ type = "info", message, sub }) {
  const variants = {
    info: {
      wrapper: "bg-blue-50 border-blue-400",
      icon: "ℹ️",
      title: "text-blue-800",
      sub: "text-blue-600",
    },
    warning: {
      wrapper: "bg-amber-50 border-amber-400",
      icon: "⚡",
      title: "text-amber-800",
      sub: "text-amber-600",
    },
    danger: {
      wrapper: "bg-red-50 border-red-500",
      icon: "🚨",
      title: "text-red-800",
      sub: "text-red-600",
    },
    success: {
      wrapper: "bg-emerald-50 border-emerald-500",
      icon: "✅",
      title: "text-emerald-800",
      sub: "text-emerald-600",
    },
    gold: {
      wrapper: "bg-amber-50 border-gold",
      icon: "🎯",
      title: "text-navy",
      sub: "text-navy/70",
    },
  };

  const v = variants[type];

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border-l-4
        animate-fadeUp ${v.wrapper}`}
    >
      {/* Icon */}
      <span className="text-xl mt-0.5 shrink-0">{v.icon}</span>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <p className={`font-heading font-semibold text-sm ${v.title}`}>
          {message}
        </p>
        {sub && (
          <p className={`text-xs font-medium ${v.sub}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}