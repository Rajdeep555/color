"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const VARIANTS = {
  // white -> light lavender, dark text (the "Sign Up" style in the reference)
  primary: {
    face: "from-white via-slate-100 to-violet-200",
    text: "text-violet-900",
  },
  // pink -> purple, white text (the "Login" style in the reference)
  secondary: {
    face: "from-fuchsia-500 via-purple-500 to-indigo-500",
    text: "text-white",
  },
};

// color of the back layer that peeks out as the "edge" — shared by both variants
const EDGE_GRADIENT = "from-pink-500 via-fuchsia-500 to-indigo-500";

export default function Button({
  children,
  variant = "primary",
  type = "button",
  fullWidth = true,
  disabled = false,
  onClick,
  className = "",
}) {
  const { face, text } = VARIANTS[variant] ?? VARIANTS.primary;

  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);
    const listener = (e) => setCanHover(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "relative select-none touch-manipulation",
        fullWidth ? "w-full" : "inline-block",
        "py-4",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "[-webkit-tap-highlight-color:transparent]",
        className,
      ].join(" ")}>
      {/* back layer — stays put, forms the visible "edge" behind the face */}
      <span
        aria-hidden
        className={[
          "-skew-x-12 absolute inset-0 translate-y-1.5",
          "bg-gradient-to-r",
          EDGE_GRADIENT,
        ].join(" ")}
      />

      {/* front layer + label — one motion element, moves down on hover/tap */}
      <motion.div
        className="absolute inset-0"
        initial={{ y: 0 }}
        whileHover={disabled || !canHover ? undefined : { y: 4 }}
        whileTap={disabled ? undefined : { y: 6 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}>
        <span
          aria-hidden
          className={[
            "-skew-x-12 absolute inset-0",
            "bg-gradient-to-r",
            face,
            "shadow-md shadow-black/30",
          ].join(" ")}
        />
        <span
          className={[
            "relative z-10 flex h-full items-center justify-center",
            "font-bold tracking-wide uppercase text-sm",
            text,
          ].join(" ")}>
          {children}
        </span>
      </motion.div>
    </button>
  );
}
