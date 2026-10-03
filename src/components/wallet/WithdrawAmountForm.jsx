"use client";

import { useState } from "react";
import { calculateWithdrawal } from "@/lib/wallet/calculateWithdrawal";
import { useGameStore } from "@/store/gameStore";
import Button from "@/components/ui/Button";
import WithdrawalProgressModal from "@/components/wallet/WithdrawalProgressModal";

const MIN_WITHDRAWAL = 100;

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

  return (
    <div className="space-y-4">
      <button
        onClick={() => setConfirmed((c) => !c)}
        className={[
          "flex w-full items-start gap-3 rounded-2xl border p-5 text-left transition-colors",
          confirmed
            ? "border-fuchsia-400/60 bg-fuchsia-500/10"
            : "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]",
        ].join(" ")}>
        <span
          className={[
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
            confirmed ? "border-fuchsia-400 bg-fuchsia-400" : "border-white/20",
          ].join(" ")}>
          {confirmed && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </span>
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Withdrawing to
            </p>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onEditBank();
              }}
              className="text-xs font-semibold text-fuchsia-400">
              Edit
            </span>
          </div>
          <p className="text-sm font-semibold text-white">
            {bankDetails.holderName}
          </p>
          <p className="text-xs text-slate-400">
            {bankDetails.bankName} · ••••{bankDetails.accountNumber.slice(-4)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            {confirmed
              ? "Confirmed — this account will receive the funds."
              : "Tap to confirm this is the correct account."}
          </p>
        </div>
      </button>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Enter amount
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-xl font-bold text-yellow-300">₹</span>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            placeholder={`Minimum ₹${MIN_WITHDRAWAL}`}
            className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-base placeholder:font-normal placeholder:text-slate-500"
          />
        </div>

        {numericAmount > 0 && (
          <div className="mt-3 space-y-1 rounded-lg bg-white/[0.03] p-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>You&apos;ll receive</span>
              <span className="font-semibold text-white">₹{numericAmount}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Fee (11%)</span>
              <span className="font-semibold text-red-400">₹{fee}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1 text-slate-300">
              <span>Total deducted from balance</span>
              <span className="font-bold text-white">₹{total}</span>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs font-semibold text-red-400">{error}</p>
        )}
        <p className="mt-2 text-[11px] text-slate-500">
          Your balance: ₹{credits.toLocaleString()}
        </p>
      </div>

      <Button variant="secondary" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Withdraw"}
      </Button>

      <WithdrawalProgressModal
        visible={showProgress}
        amount={submittedAmount}
        onClose={() => setShowProgress(false)}
      />
    </div>
  );
}
