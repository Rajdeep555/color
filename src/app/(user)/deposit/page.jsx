"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import AmountPickerModal from "@/components/wallet/AmountPickerModal";

const MIN_DEPOSIT = 100;
const QUICK_AMOUNTS = [100, 300, 500, 1000, 2000, 5000];

// `tone` only changes the icon colour of each account card.
const QR_ACCOUNTS = [
  {
    id: "vip01",
    label: "VIP 01",
    note: "Standard QR",
    tone: "from-violet-500 to-indigo-500",
  },
  {
    id: "vvip001",
    label: "VVIP 001",
    note: "Priority QR",
    tone: "from-amber-400 to-orange-500",
  },
  {
    id: "vip02",
    label: "VIP 02",
    note: "Standard QR",
    tone: "from-fuchsia-500 to-pink-500",
  },
];

const STEPS = ["Amount", "Pay", "Done"];

/* ---------- small inline icons (no extra dependency) ---------- */
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

const PencilIcon = (p) => (
  <Icon {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Icon>
);
const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);
const QrIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
  </Icon>
);
const ShieldIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

/* ---------- steps ---------- */
function Stepper({ current = 0 }) {
  return (
    <ol className="flex items-center">
      {STEPS.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                  active
                    ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_14px_rgba(168,85,247,0.6)]"
                    : done
                      ? "bg-emerald-500 text-white"
                      : "bg-white/[0.06] text-slate-500",
                ].join(" ")}>
                {done ? <CheckIcon className="h-3 w-3" /> : i + 1}
              </span>
              <span
                className={`text-xs font-semibold ${active ? "text-white" : "text-slate-500"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="mx-3 h-px flex-1 bg-white/10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState(QR_ACCOUNTS[0].id);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const numeric = Number(amount);
  const hasAmount = !!amount && !Number.isNaN(numeric) && numeric > 0;

  const handleContinue = () => {
    if (!amount || Number.isNaN(numeric) || numeric < MIN_DEPOSIT) {
      setError(`Minimum deposit is ₹${MIN_DEPOSIT}.`);
      return;
    }
    router.push(`/deposit/pay?amount=${numeric}&account=${account}`);
  };

  const pickQuick = (value) => {
    setAmount(String(value));
    setError("");
  };

  const selectedAccount = QR_ACCOUNTS.find((a) => a.id === account);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0b0518] px-4 pb-36 text-white">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(147,51,234,0.28),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-24 top-64 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-3xl" />

      <div className="relative z-10">
        <PageHeader title="Deposit" />

        <div className="space-y-6">
          <Stepper current={0} />

          {/* ---------- amount hero ---------- */}
          <section>
            <button
              onClick={() => setPickerOpen(true)}
              aria-label="Enter deposit amount"
              className={[
                "group block w-full rounded-3xl p-px text-left transition-shadow",
                error
                  ? "bg-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                  : "bg-gradient-to-br from-violet-500/70 via-white/10 to-fuchsia-500/50 shadow-[0_10px_40px_rgba(124,58,237,0.18)]",
              ].join(" ")}>
              <div className="relative overflow-hidden rounded-[23px] bg-[#150a29] px-5 pb-5 pt-4">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="relative flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">
                    You deposit
                  </p>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-semibold text-violet-200 transition-colors group-active:bg-white/15">
                    <PencilIcon className="h-3 w-3" />
                    {hasAmount ? "Edit" : "Enter"}
                  </span>
                </div>

                <div className="relative mt-3 flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl font-semibold ${hasAmount ? "text-violet-300" : "text-slate-600"}`}>
                    ₹
                  </span>
                  <span
                    className={`text-5xl font-bold tabular-nums tracking-tight ${hasAmount ? "text-white" : "text-slate-600"}`}>
                    {hasAmount ? numeric.toLocaleString("en-IN") : "0"}
                  </span>
                </div>

                <p
                  className={`relative mt-3 text-xs ${error ? "font-semibold text-red-400" : "text-slate-500"}`}>
                  {error || `Minimum deposit ₹${MIN_DEPOSIT}`}
                </p>
              </div>
            </button>

            {/* quick amounts */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((v) => {
                const on = amount === String(v);
                return (
                  <button
                    key={v}
                    onClick={() => pickQuick(v)}
                    className={[
                      "rounded-xl border py-2.5 text-sm font-semibold tabular-nums transition-all active:scale-95",
                      on
                        ? "border-violet-400/70 bg-violet-500/20 text-white shadow-[0_0_16px_rgba(139,92,246,0.35)]"
                        : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]",
                    ].join(" ")}>
                    ₹{v.toLocaleString("en-IN")}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ---------- QR account ---------- */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Pay with QR account
              </h2>
              <span className="text-[11px] text-slate-500">Choose one</span>
            </div>

            <div role="radiogroup" className="space-y-2.5">
              {QR_ACCOUNTS.map((acc) => {
                const selected = account === acc.id;
                return (
                  <button
                    key={acc.id}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAccount(acc.id)}
                    className={[
                      "flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99]",
                      selected
                        ? "border-fuchsia-400/60 bg-gradient-to-r from-fuchsia-500/15 to-violet-500/10 shadow-[0_0_24px_rgba(217,70,239,0.15)]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                    ].join(" ")}>
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${acc.tone}`}>
                      <QrIcon className="h-5 w-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">
                        {acc.label}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {acc.note}
                      </span>
                    </span>

                    <span
                      className={[
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        selected
                          ? "border-fuchsia-400 bg-fuchsia-400 text-[#0b0518]"
                          : "border-white/20 text-transparent",
                      ].join(" ")}>
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ---------- reassurance ---------- */}
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] p-3.5">
            <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <p className="text-xs leading-relaxed text-slate-300">
              You&apos;ll see the QR code on the next screen. Pay the exact
              amount shown there so your deposit can be matched.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- sticky action bar ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0b0518]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-4 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400">
              {selectedAccount?.label}
            </p>
            <p className="truncate text-lg font-bold tabular-nums text-white">
              {hasAmount ? `₹${numeric.toLocaleString("en-IN")}` : "₹0"}
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.4)] transition-transform active:scale-[0.98]">
            Continue to pay
          </button>
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
