"use client";

import { useState } from "react";
import { calculateWithdrawal } from "@/lib/wallet/calculateWithdrawal";
import { useGameStore } from "@/store/gameStore";
import WithdrawalProgressModal from "@/components/wallet/WithdrawalProgressModal";

const MIN_WITHDRAWAL = 100;
const QUICK_AMOUNTS = [100, 500, 1000, 2000];

/* ---------- small inline icons ---------- */
const Icon = ({ children, className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true">
    {children}
  </svg>
);
const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);
const PencilIcon = (p) => (
  <Icon {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Icon>
);
const BankIcon = (p) => (
  <Icon {...p}>
    <path d="M3 10 12 4l9 6" />
    <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />
  </Icon>
);
const WalletIcon = (p) => (
  <Icon {...p}>
    <path d="M20 7H5a2 2 0 0 1 0-4h13v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15V7" />
    <path d="M16 14h.01" />
  </Icon>
);
const AlertIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </Icon>
);

// Largest amount whose total (amount + fee) still fits in the balance.
function maxWithdrawable(credits) {
  if (!credits || credits <= 0) return 0;
  let n = Math.floor(credits / 1.11);
  while (n > 0 && calculateWithdrawal(n).total > credits) n--;
  while (calculateWithdrawal(n + 1).total <= credits) n++;
  return n;
}

export default function WithdrawAmountForm({
  credits,
  bankDetails,
  onEditBank,
}) {
  const setCredits = useGameStore((s) => s.setCredits);
  const addWithdrawalRecord = useGameStore((s) => s.addWithdrawalRecord);

  const [amount, setAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState(0);

  const numericAmount = Number(amount) || 0;
  const { fee, total } = calculateWithdrawal(numericAmount);
  const max = maxWithdrawable(credits);

  const handleSubmit = async () => {
    if (!confirmed) {
      setError("Confirm your account details before withdrawing.");
      return;
    }
    if (!amount || numericAmount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is ₹${MIN_WITHDRAWAL}.`);
      return;
    }
    if (total > credits) {
      setError(
        `Insufficient balance — you need ₹${total} to withdraw ₹${numericAmount}.`,
      );
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          fee,
          total,
          bankDetails,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // server already decremented the balance — set credits from its
      // response directly rather than guessing locally, so it's exact
      setCredits(Number(data.balance));
      addWithdrawalRecord({
        id: data.transaction.id,
        amount: numericAmount,
        fee,
        total,
        status: "pending",
        createdAt: Date.now(),
      });

      setSubmittedAmount(numericAmount);
      setShowProgress(true);
      setAmount("");
      setConfirmed(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pick = (v) => {
    setAmount(String(v));
    setError("");
  };

  return (
    <div className="space-y-5">
      {/* ---------- balance ---------- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-5 shadow-[0_12px_40px_rgba(124,58,237,0.35)]">
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-fuchsia-300/20 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/70">
              Available balance
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-white">
              ₹{Number(credits || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
            <WalletIcon className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* ---------- destination account ---------- */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Withdraw to</h2>
          <button
            onClick={onEditBank}
            className="flex items-center gap-1 rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-semibold text-violet-200 transition-colors active:bg-white/15">
            <PencilIcon className="h-3 w-3" />
            Edit
          </button>
        </div>

        <div
          className={[
            "overflow-hidden rounded-2xl border transition-colors",
            confirmed
              ? "border-fuchsia-400/60 bg-fuchsia-500/[0.07]"
              : "border-white/10 bg-white/[0.04]",
          ].join(" ")}>
          <div className="flex items-center gap-3.5 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg">
              <BankIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {bankDetails.holderName}
              </p>
              <p className="truncate text-xs text-slate-400">
                {bankDetails.bankName}
              </p>
            </div>
            <p className="shrink-0 font-mono text-sm tracking-wider text-slate-300">
              ••••{bankDetails.accountNumber.slice(-4)}
            </p>
          </div>

          <button
            onClick={() => {
              setConfirmed((c) => !c);
              setError("");
            }}
            role="checkbox"
            aria-checked={confirmed}
            className="flex w-full items-center gap-3 border-t border-dashed border-white/10 px-4 py-3 text-left">
            <span
              className={[
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                confirmed
                  ? "border-fuchsia-400 bg-fuchsia-400 text-[#0b0518]"
                  : "border-white/25 text-transparent",
              ].join(" ")}>
              <CheckIcon className="h-3 w-3" />
            </span>
            <span
              className={`text-xs ${confirmed ? "font-semibold text-fuchsia-200" : "text-slate-400"}`}>
              {confirmed
                ? "Confirmed — this account will receive the funds"
                : "Tap to confirm this is the correct account"}
            </span>
          </button>
        </div>
      </section>

      {/* ---------- amount ---------- */}
      <section>
        <h2 className="mb-2.5 text-sm font-semibold text-white">Amount</h2>

        <div
          className={[
            "rounded-3xl p-px transition-shadow",
            error
              ? "bg-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
              : "bg-gradient-to-br from-violet-500/70 via-white/10 to-fuchsia-500/50 shadow-[0_10px_40px_rgba(124,58,237,0.15)]",
          ].join(" ")}>
          <div className="relative overflow-hidden rounded-[23px] bg-[#150a29] px-5 pb-4 pt-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

            <label className="relative flex items-center gap-2">
              <span
                className={`text-3xl font-semibold ${amount ? "text-violet-300" : "text-slate-600"}`}>
                ₹
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                placeholder="0"
                className="w-full bg-transparent text-5xl font-bold tabular-nums tracking-tight text-white outline-none placeholder:text-slate-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>

            <p className="relative mt-3 text-xs text-slate-500">
              Minimum ₹{MIN_WITHDRAWAL} · Max you can withdraw now ₹
              {max.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* quick amounts */}
        <div className="mt-3 grid grid-cols-5 gap-2">
          {QUICK_AMOUNTS.map((v) => {
            const on = amount === String(v);
            const unaffordable = calculateWithdrawal(v).total > credits;
            return (
              <button
                key={v}
                onClick={() => pick(v)}
                disabled={unaffordable}
                className={[
                  "rounded-xl border py-2 text-xs font-semibold tabular-nums transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100",
                  on
                    ? "border-violet-400/70 bg-violet-500/20 text-white shadow-[0_0_14px_rgba(139,92,246,0.35)]"
                    : "border-white/10 bg-white/[0.04] text-slate-300",
                ].join(" ")}>
                ₹{v.toLocaleString("en-IN")}
              </button>
            );
          })}
          <button
            onClick={() => pick(max)}
            disabled={max < MIN_WITHDRAWAL}
            className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 py-2 text-xs font-bold text-fuchsia-200 transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100">
            Max
          </button>
        </div>
      </section>

      {/* ---------- receipt ---------- */}
      {numericAmount > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span>You&apos;ll receive</span>
            <span className="font-semibold text-emerald-300">
              ₹{numericAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-slate-400">
            <span>Fee (11%)</span>
            <span className="font-semibold text-red-400">
              ₹{fee.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="my-3 border-t border-dashed border-white/15" />
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Deducted from balance</span>
            <span className="text-lg font-bold tabular-nums text-white">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}

      {/* ---------- error ---------- */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-400/30 bg-red-500/10 p-3.5">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-xs font-semibold leading-relaxed text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* ---------- submit ---------- */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.4)] transition-transform active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100">
        {submitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Submitting...
          </>
        ) : numericAmount >= MIN_WITHDRAWAL ? (
          `Withdraw ₹${numericAmount.toLocaleString("en-IN")}`
        ) : (
          "Withdraw"
        )}
      </button>

      <WithdrawalProgressModal
        visible={showProgress}
        amount={submittedAmount}
        onClose={() => setShowProgress(false)}
      />
    </div>
  );
}
