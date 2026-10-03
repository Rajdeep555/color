"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "deposits", label: "Deposits" },
  { id: "withdrawals", label: "Withdrawals" },
];

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null);
  const [tab, setTab] = useState("deposits");
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role === "ADMIN") {
          setAuthorized(true);
          loadAll();
        } else {
          setAuthorized(false);
          router.push("/home");
        }
      })
      .catch(() => {
        setAuthorized(false);
        router.push("/login");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [depRes, wdRes] = await Promise.all([
      fetch("/api/admin/deposits"),
      fetch("/api/admin/withdrawals"),
    ]);
    if (depRes.ok) setDeposits((await depRes.json()).deposits);
    if (wdRes.ok) setWithdrawals((await wdRes.json()).withdrawals);
    setLoading(false);
  };

  const handleConfirmDeposit = async (id) => {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/deposits/${id}/confirm`, {
        method: "POST",
      });
      if (res.ok) setDeposits((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setActingId(null);
    }
  };

  const handleCompleteWithdrawal = async (id) => {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/complete`, {
        method: "POST",
      });
      if (res.ok) setWithdrawals((prev) => prev.filter((w) => w.id !== id));
    } finally {
      setActingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  };

  if (authorized !== true) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0b0518] text-slate-400">
        Checking access...
      </div>
    );
  }

  const items = tab === "deposits" ? deposits : withdrawals;

  return (
    <div className="min-h-dvh bg-[#0b0518] px-6 py-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-red-400">
          Logout
        </button>
      </div>

      <div className="mb-5 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.id
                ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white"
                : "bg-white/5 text-slate-400",
            ].join(" ")}>
            {t.label} (
            {t.id === "deposits" ? deposits.length : withdrawals.length})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-slate-400">No pending {tab}.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">
                  {tab === "deposits" ? "UTR" : "Details"}
                </th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{item.user.name}</p>
                    <p className="text-xs text-slate-500">{item.user.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">
                    <span
                      className={
                        tab === "deposits" ? "text-emerald-400" : "text-red-400"
                      }>
                      {tab === "deposits" ? "+" : "-"}₹
                      {Number(item.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {tab === "deposits" ? item.referenceId : item.description}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        tab === "deposits"
                          ? handleConfirmDeposit(item.id)
                          : handleCompleteWithdrawal(item.id)
                      }
                      disabled={actingId === item.id}
                      className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                      {actingId === item.id
                        ? "Processing..."
                        : tab === "deposits"
                          ? "Confirm"
                          : "Complete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
