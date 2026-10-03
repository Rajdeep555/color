"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import {
  UPI_ACCOUNTS,
  buildUpiUri,
  generateTransactionRef,
} from "@/lib/wallet/upiAccounts";

function DepositPayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amount = searchParams.get("amount");
  const account = searchParams.get("account");
  const accountInfo = UPI_ACCOUNTS[account];

  // generated once per page load — this is the "random" part: a unique
  // reference for THIS deposit attempt, not a random payee
  const transactionRef = useMemo(() => generateTransactionRef(), []);
  const upiUri = useMemo(
    () => buildUpiUri({ account, amount, transactionRef }),
    [account, amount, transactionRef],
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUri || "")}`;

  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const handleSaveQr = async () => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `deposit-qr-${accountInfo?.payeeName || account}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, "_blank");
    }
  };

  const handleSubmit = async () => {
    if (!utr.trim()) {
      setError("Enter your UTR number to confirm the payment.");
      return;
    }
    setError("");
    setStatus("submitting");

    try {
      // TODO: replace with your real endpoint — this is a placeholder call.
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          account,
          utr: utr.trim(),
          transactionRef,
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center bg-[#0b0518] px-6 text-center text-white">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
          ✅
        </div>
        <h1 className="text-xl font-bold">Request submitted</h1>
        <p className="mt-2 text-sm text-slate-400">
          Your deposit of ₹{amount} is awaiting verification. It will reflect in
          your balance once confirmed.
        </p>
        <Button className="mt-6" onClick={() => router.push("/home")}>
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0b0518] px-4 pb-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(147,51,234,0.25),transparent_55%)]" />

      <div className="relative z-10">
        <PageHeader title="Complete payment" />

        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Amount
            </p>
            <p className="mt-1 text-2xl font-extrabold text-yellow-300">
              ₹{amount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Paying to {accountInfo?.payeeName || account}
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Ref: {transactionRef}
            </p>

            <div className="mx-auto mt-4 w-fit rounded-xl bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt={`UPI QR for ${accountInfo?.payeeName || account}`}
                width={220}
                height={220}
              />
            </div>

            {/* direct deep link — the actually-usable path when the user
                is on the same phone they'd otherwise be scanning with */}
            <a
              href={upiUri}
              className="mt-4 block w-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 py-2.5 text-sm font-bold text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]">
              Pay via UPI app
            </a>

            <button
              onClick={handleSaveQr}
              className="mt-2 w-full rounded-full bg-white/10 py-2.5 text-sm font-semibold text-white">
              Save QR code
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              UTR number
            </p>
            <input
              type="text"
              value={utr}
              onChange={(e) => {
                setUtr(e.target.value);
                setError("");
              }}
              placeholder="Enter the UTR from your payment app"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-fuchsia-500"
            />
            {error && (
              <p className="mt-2 text-xs font-semibold text-red-400">{error}</p>
            )}
            <p className="mt-2 text-[11px] text-slate-500">
              After paying, enter the UTR (transaction reference number) shown
              in your payment app so we can verify it.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={handleSubmit}
            disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Submit"}
          </Button>

          {status === "error" && (
            <p className="text-center text-xs font-semibold text-red-400">
              Something went wrong submitting your request. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DepositPayPage() {
  return (
    <Suspense fallback={null}>
      <DepositPayContent />
    </Suspense>
  );
}
