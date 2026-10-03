"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function AmountPickerModal({
  open,
  onClose,
  onConfirm,
  initialValue = "",
  min,
  quickAmounts = [],
  title = "Enter amount",
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  const numeric = Number(value) || 0;
  const isValid = value && (!min || numeric >= min);

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(numeric);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl border-t border-white/10 bg-[#150c28] p-5"
            style={{
              paddingBottom:
                "max(2rem, calc(env(safe-area-inset-bottom) + 1.5rem))",
            }}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
            <p className="mb-3 text-sm font-semibold text-white">{title}</p>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-xl font-bold text-yellow-300">₹</span>
              <input
                autoFocus
                type="number"
                inputMode="numeric"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={min ? `Minimum ₹${min}` : "Amount"}
                className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-base placeholder:font-normal placeholder:text-slate-500"
              />
            </div>

            {quickAmounts.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {quickAmounts.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setValue(String(chip))}
                    className={[
                      "rounded-full py-2 text-sm font-bold transition-all",
                      Number(value) === chip
                        ? "bg-gradient-to-r from-yellow-300 to-amber-400 text-black"
                        : "bg-white/5 text-slate-300",
                    ].join(" ")}>
                    ₹{chip.toLocaleString()}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 py-3 text-sm font-bold text-white disabled:opacity-40">
              Confirm
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
