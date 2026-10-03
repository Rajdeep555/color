"use client";

import { AnimatePresence, motion } from "motion/react";

export default function WithdrawalProgressModal({ visible, amount, onClose }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-6 max-w-xs rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#1a1030] to-[#0b0518] p-6 text-center shadow-[0_0_60px_rgba(251,191,36,0.2)]">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 rounded-full border-2 border-amber-400 border-t-transparent"
              />
            </div>
            <h2 className="text-xl font-extrabold italic tracking-tight text-white">
              Withdrawal in progress
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              ₹{amount?.toLocaleString()} is on its way to your bank account.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              You&apos;ll be notified once it&apos;s approved.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-white/10 py-2 text-sm font-semibold text-white">
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
