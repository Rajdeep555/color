const TONES = {
  violet: {
    soft: "from-violet-50 via-white to-white",
    chip: "bg-violet-500 text-white shadow-violet-500/40",
    glow: "bg-violet-400/25",
    value: "text-violet-950",
    pill: "bg-violet-100 text-violet-700",
    ring: "ring-violet-200/70",
    dot: "bg-violet-500",
  },
  emerald: {
    soft: "from-emerald-50 via-white to-white",
    chip: "bg-emerald-500 text-white shadow-emerald-500/40",
    glow: "bg-emerald-400/25",
    value: "text-emerald-950",
    pill: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-200/70",
    dot: "bg-emerald-500",
  },
  amber: {
    soft: "from-amber-50 via-white to-white",
    chip: "bg-amber-500 text-white shadow-amber-500/40",
    glow: "bg-amber-400/30",
    value: "text-amber-950",
    pill: "bg-amber-100 text-amber-800",
    ring: "ring-amber-200/80",
    dot: "bg-amber-500",
  },
  red: {
    soft: "from-rose-50 via-white to-white",
    chip: "bg-rose-500 text-white shadow-rose-500/40",
    glow: "bg-rose-400/25",
    value: "text-rose-950",
    pill: "bg-rose-100 text-rose-700",
    ring: "ring-rose-200/70",
    dot: "bg-rose-500",
  },
  sky: {
    soft: "from-sky-50 via-white to-white",
    chip: "bg-sky-500 text-white shadow-sky-500/40",
    glow: "bg-sky-400/25",
    value: "text-sky-950",
    pill: "bg-sky-100 text-sky-700",
    ring: "ring-sky-200/70",
    dot: "bg-sky-500",
  },
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "violet",
  count,
  urgent = false,
  hero = false,
}) {
  const t = TONES[tone] || TONES.violet;
  const showPulse = urgent && Number(count) > 0;

  if (hero) {
    return (
      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 text-white shadow-xl shadow-violet-900/20 ring-1 ring-white/10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-0 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-200/80">
            {label}
          </p>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
            {icon}
          </span>
        </div>
        <p className="relative mt-4 truncate text-4xl font-extrabold tabular-nums tracking-tight sm:text-5xl">
          {value}
        </p>
        {sub && (
          <p className="relative mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-100 ring-1 ring-white/15">
            {sub}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${t.soft} p-5 shadow-sm ring-1 ${t.ring} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}>
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full ${t.glow} blur-2xl transition-transform duration-300 group-hover:scale-125`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg ${t.chip}`}>
          {icon}
        </span>
      </div>

      <div className="relative mt-3 flex items-end gap-2">
        <p
          className={`min-w-0 truncate text-3xl font-extrabold tabular-nums leading-none tracking-tight sm:text-[34px] ${t.value}`}>
          {value}
        </p>
        {count !== undefined && count !== null && (
          <span
            className={`mb-0.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-extrabold tabular-nums ${t.pill}`}>
            {showPulse && (
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${t.dot}`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${t.dot}`}
                />
              </span>
            )}
            {count}
          </span>
        )}
      </div>

      {sub && (
        <p className="relative mt-3 text-xs font-medium text-slate-500">
          {sub}
        </p>
      )}
    </div>
  );
}
