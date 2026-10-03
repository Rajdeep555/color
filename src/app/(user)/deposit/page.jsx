"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import AmountPickerModal from "@/components/wallet/AmountPickerModal";

const MIN_DEPOSIT = 100;
const QUICK_AMOUNTS = [100, 300, 500, 1000, 2000, 5000];
const QR_ACCOUNTS = [
  { id: "vip01", label: "VIP 01" },
  { id: "vvip001", label: "VVIP 001" },
  { id: "vip02", label: "VIP 02" },
];

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState(QR_ACCOUNTS[0].id);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleContinue = () => {
    const numeric = Number(amount);
    if (!amount || Number.isNaN(numeric) || numeric < MIN_DEPOSIT) {
      setError(`Minimum deposit is ₹${MIN_DEPOSIT}.`);
      return;
    }
    router.push(`/deposit/pay?amount=${numeric}&account=${account}`);
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0b0518] px-4 pb-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(147,51,234,0.25),transparent_55%)]" />

      <div className="relative z-10">
        <PageHeader title="Deposit" />

        <div className="space-y-5">
          {/* amount — tap to open the picker, no inline number input anymore */}
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Amount
            </p>
            <p
              className={`text-2xl font-bold ${amount ? "text-white" : "text-slate-500"}`}>
              {amount
                ? `₹${Number(amount).toLocaleString()}`
                : `Tap to enter amount`}
            </p>
            {error && (
              <p className="mt-2 text-xs font-semibold text-red-400">{error}</p>
            )}
            <p className="mt-2 text-[11px] text-slate-500">
              Minimum deposit amount is ₹{MIN_DEPOSIT}.
            </p>
          </button>

          {/* QR account selection — radio cards */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Select QR account
            </p>
            <div className="space-y-2">
              {QR_ACCOUNTS.map((acc) => {
                const selected = account === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => setAccount(acc.id)}
                    className={[
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors",
                      selected
                        ? "border-fuchsia-400/60 bg-fuchsia-500/10"
                        : "border-white/10 bg-white/[0.03]",
                    ].join(" ")}>
                    <span className="text-sm font-semibold text-white">
                      {acc.label}
                    </span>
                    <span
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border-2",
                        selected ? "border-fuchsia-400" : "border-white/20",
                      ].join(" ")}>
                      {selected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button variant="secondary" onClick={handleContinue}>
            Deposit
          </Button>
        </div>
      </div>

      <AmountPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(value) => {
          setAmount(String(value));
          setError("");
        }}
        initialValue={amount}
        min={MIN_DEPOSIT}
        quickAmounts={QUICK_AMOUNTS}
        title="Enter deposit amount"
      />
    </div>
  );
}
