"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Successful" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const RANGE_OPTIONS = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All time" },
];

const BADGE = {
  PENDING: "bg-amber-500/15 text-amber-300",
  SUCCESS: "bg-emerald-500/15 text-emerald-300",
  FAILED: "bg-red-500/15 text-red-300",
  CANCELLED: "bg-white/10 text-white/60",
  REFUNDED: "bg-sky-500/15 text-sky-300",
};
const LABEL = Object.fromEntries(
  STATUS_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label]),
);
const METHOD = { UPI: "UPI", CARD: "Card", OTHER: "Other" };

const inr = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const fmtDate = (iso) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

const chip = (active) =>
  `h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 ${
    active
      ? "border-violet-500 bg-violet-600 text-white"
      : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
  }`;

export default function TransactionHistory({ kind }) {
  const isDeposit = kind === "deposit";
  const noun = isDeposit ? "deposit" : "withdrawal";

  const [status, setStatus] = useState("");
  const [range, setRange] = useState("30d");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reqId = useRef(0);

  const load = useCallback(
    async (nextPage, reset) => {
      const id = ++reqId.current;
      setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams({ kind, range, page: String(nextPage) });
        if (status) qs.set("status", status);

        const res = await fetch(`/api/wallet/history?${qs}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Could not load your history.");
        }
        const data = await res.json();
        if (id !== reqId.current) return; // a newer request replaced this one

        setItems((prev) =>
          reset
            ? data.items
            : [
                ...prev,
                ...data.items.filter((n) => !prev.some((p) => p.id === n.id)),
              ],
        );
        setPage(nextPage);
        setHasMore(data.hasMore);
        if (data.summary) setSummary(data.summary);
      } catch (e) {
        if (id === reqId.current)
          setError(e.message || "Could not load your history.");
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [kind, range, status],
  );

  useEffect(() => {
    setItems([]);
    setSummary(null);
    load(1, true);
  }, [load]);

  return (
    <div className="space-y-4">
      {/* summary */}
      <div className="rounded-2xl border border-white/10 bg-[#1a1226] p-4">
        <p className="text-sm text-white/55">
          Total {isDeposit ? "deposited" : "withdrawn"}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
          {summary ? inr(summary.successTotal) : "—"}
        </p>
        <p className="mt-0.5 text-xs text-white/40">
          {summary
            ? `${summary.successCount} successful ${noun}${summary.successCount === 1 ? "" : "s"} in this period`
            : "Loading…"}
        </p>
      </div>

      {/* filters */}
      <div className="space-y-2">
        <div
          role="group"
          aria-label="Filter by status"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value || "all"}
              type="button"
              onClick={() => setStatus(o.value)}
              aria-pressed={status === o.value}
              className={chip(status === o.value)}>
              {o.label}
            </button>
          ))}
        </div>
        <div
          role="group"
          aria-label="Filter by period"
          className="flex items-center gap-2">
          <span className="text-xs text-white/40">Period</span>
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setRange(o.value)}
              aria-pressed={range === o.value}
              className={chip(range === o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* list */}
      <div className="space-y-2">
        {items.map((t) => (
          <article
            key={t.id}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#1a1226] p-3.5">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isDeposit
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-white/10 text-white/70"
              }`}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true">
                <path
                  d={
                    isDeposit
                      ? "M12 19V5M5 12l7-7 7 7"
                      : "M12 5v14M5 12l7 7 7-7"
                  }
                />
              </svg>
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-semibold tabular-nums text-white">
                  {inr(t.amount)}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${BADGE[t.status]}`}>
                  {LABEL[t.status] ?? t.status}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/45">
                {fmtDate(t.transactionDate)} ·{" "}
                {METHOD[t.paymentMethod] ?? t.paymentMethod}
              </p>
              {(t.referenceId || t.transactionNumber) && (
                <p className="mt-1 truncate text-xs tabular-nums text-white/35">
                  {t.referenceId
                    ? `Ref ${t.referenceId}`
                    : `Txn ${t.transactionNumber}`}
                </p>
              )}
              {t.description && (
                <p className="mt-1 text-xs text-white/50">{t.description}</p>
              )}
            </div>
          </article>
        ))}

        {loading &&
          items.length === 0 &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[76px] animate-pulse rounded-xl border border-white/10 bg-white/[0.04]"
            />
          ))}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center">
            <p className="text-sm text-white/70">No {noun}s found</p>
            <p className="mt-1 text-xs text-white/40">
              Try a different status or period.
            </p>
            <Link
              href={isDeposit ? "/deposit" : "/withdraw"}
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-500">
              {isDeposit ? "Add money" : "Withdraw money"}
            </Link>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <p className="text-sm text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => load(1, true)}
              className="mt-3 h-9 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10">
              Try again
            </button>
          </div>
        )}

        {hasMore && !error && (
          <button
            type="button"
            onClick={() => load(page + 1, false)}
            disabled={loading}
            className="h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50">
            {loading ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
