"use client";

import { forwardRef } from "react";

const InputField = forwardRef(function InputField(
  { label, error, type = "text", className = "", ...rest },
  ref,
) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={[
          "w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500",
          "outline-none transition-colors",
          error
            ? "border-red-500 focus:border-red-400"
            : "border-white/10 focus:border-fuchsia-500",
          className,
        ].join(" ")}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
});

export default InputField;
