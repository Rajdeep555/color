"use client";

const STATUS_STYLE = {
  pending: "bg-amber-500/15 text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-red-500/15 text-red-400",
};

function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WithdrawHistory({ history }) {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Withdrawal history
      </p>

      <div className="space-y-2">
        {history.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-500">
            No withdrawals yet — your requests will show up here.
          </p>
        )}
        {history.map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5 text-sm">
            <div>
              <p className="font-semibold text-white">
                ₹{w.amount.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500">
                {formatDate(w.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${STATUS_STYLE[w.status]}`}>
                {w.status}
              </span>
              <p className="mt-1 text-[11px] text-slate-500">
                -₹{w.total.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
