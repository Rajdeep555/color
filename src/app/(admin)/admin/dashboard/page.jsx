"use client";

/**
 * Admin dashboard (light theme).
 * Needs:  npm i recharts
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const inr = (n) =>
  n === null || n === undefined || Number.isNaN(Number(n))
    ? "—"
    : `₹${Number(n).toLocaleString("en-IN")}`;
const num = (n) =>
  n === null || n === undefined ? "—" : Number(n).toLocaleString("en-IN");
const fmtDate = (d) =>
  new Date(d).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

async function getJson(url) {
  try {
    const res = await fetch(url);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

const C = {
  violet: "#7c3aed",
  fuchsia: "#d946ef",
  emerald: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  grid: "#e2e8f0",
  axis: "#94a3b8",
};

const STATUS_TONE = {
  PENDING: "amber",
  SUCCESS: "emerald",
  FAILED: "red",
  CANCELLED: "slate",
  REFUNDED: "sky",
};
const STATUS_LABEL = {
  PENDING: "Pending",
  SUCCESS: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};
// which tab a status belongs to
const tabOf = (s) =>
  s === "PENDING" ? "PENDING" : s === "SUCCESS" ? "SUCCESS" : "FAILED";

/* ------------------------------------------------------------------ */
/* icons                                                               */
/* ------------------------------------------------------------------ */

const Icon = ({ children, className = "h-5 w-5" }) => (
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
const I = {
  dashboard: (p) => (
    <Icon {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Icon>
  ),
  deposit: (p) => (
    <Icon {...p}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </Icon>
  ),
  withdraw: (p) => (
    <Icon {...p}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Icon>
  ),
  users: (p) => (
    <Icon {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.3c2.2.7 3.5 2.6 3.5 5.7" />
    </Icon>
  ),
  trophy: (p) => (
    <Icon {...p}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </Icon>
  ),
  shield: (p) => (
    <Icon {...p}>
      <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6Z" />
    </Icon>
  ),
  clock: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),
  check: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </Icon>
  ),
  scale: (p) => (
    <Icon {...p}>
      <path d="M12 3v18M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0Zm14 0-3 7a3.5 3.5 0 0 0 6 0Z" />
    </Icon>
  ),
  menu: (p) => (
    <Icon {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  ),
  logout: (p) => (
    <Icon {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </Icon>
  ),
  search: (p) => (
    <Icon {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  ),
  x: (p) => (
    <Icon {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  ),
};

/* ------------------------------------------------------------------ */
/* small UI pieces                                                     */
/* ------------------------------------------------------------------ */

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const Empty = ({ children }) => (
  <div className="flex h-full min-h-[10rem] items-center justify-center text-sm text-slate-400">
    {children}
  </div>
);

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={[
            "rounded-lg px-4 py-1.5 text-sm font-semibold transition-all",
            value === o.id
              ? `bg-white shadow-sm ${o.active || "text-violet-700"}`
              : "text-slate-500 hover:text-slate-700",
          ].join(" ")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-400 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 sm:w-72">
      {I.search({ className: "h-4 w-4" })}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

function Table({ head, children, empty, isEmpty }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {isEmpty ? (
        <Empty>{empty}</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                {head.map((h, i) => (
                  <th key={i} className="whitespace-nowrap px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">{children}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const UserCell = ({ user }) => (
  <div className="flex items-center gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
      {(user?.name || "?").charAt(0).toUpperCase()}
    </span>
    <div className="min-w-0">
      <p className="truncate font-semibold text-slate-900">{user?.name}</p>
      <p className="text-xs text-slate-400">{user?.phone}</p>
    </div>
  </div>
);

const Badge = ({ tone, children }) => {
  const map = {
    violet: "bg-violet-100 text-violet-700",
    sky: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone] || map.slate}`}>
      {children}
    </span>
  );
};

function ActionButton({ busy, onClick, children }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-50">
      {busy ? "Processing..." : children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: I.dashboard },
  { id: "deposits", label: "Deposits", icon: I.deposit },
  { id: "withdrawals", label: "Withdrawals", icon: I.withdraw },
  { id: "users", label: "Users", icon: I.users },
  { id: "winloss", label: "Win & Loss", icon: I.trophy },
];

const TITLES = {
  dashboard: ["Dashboard", "Overview of money, users and games"],
  deposits: ["Deposits", "Confirm pending deposits and review past ones"],
  withdrawals: [
    "Withdrawals",
    "Pay out pending withdrawals and review past ones",
  ],
  users: ["Users", "Everyone registered on the platform"],
  winloss: ["Win & Loss", "What each user won or lost, per game"],
};

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null);
  const [me, setMe] = useState(null);
  const [view, setView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  // sub-state for tabs
  const [userFilter, setUserFilter] = useState("ALL");
  const [userQuery, setUserQuery] = useState("");
  const [wlTab, setWlTab] = useState("WIN");
  const [wlQuery, setWlQuery] = useState("");
  const [txTab, setTxTab] = useState("ALL");
  const [txQuery, setTxQuery] = useState("");

  /* ---------- loaders ---------- */

  const loadStats = useCallback(async () => {
    const data = await getJson("/api/admin/stats");
    if (data) setStats(data);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [dep, wd, st, us, gr] = await Promise.all([
      getJson("/api/admin/deposits"),
      getJson("/api/admin/withdrawals"),
      getJson("/api/admin/stats"),
      getJson("/api/admin/users"),
      getJson("/api/admin/game-results"),
    ]);
    if (dep) setDeposits(dep.deposits ?? []);
    if (wd) setWithdrawals(wd.withdrawals ?? []);
    if (st) setStats(st);
    if (us) setUsers(us.users ?? []);
    if (gr) {
      setResults(gr.results ?? []);
      setTotals(gr.totals ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role === "ADMIN") {
          setMe(data.user);
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

  /* ---------- actions ---------- */

  const handleConfirmDeposit = async (id) => {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/deposits/${id}/confirm`, {
        method: "POST",
      });
      if (res.ok) {
        setDeposits((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: "SUCCESS" } : d)),
        );
        loadStats();
      }
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
      if (res.ok) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: "SUCCESS" } : w)),
        );
        loadStats();
      }
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

  /* ---------- derived data ---------- */

  const dep = stats?.deposits;
  const wd = stats?.withdrawals;

  const pendingDepositCount = deposits.filter(
    (d) => d.status === "PENDING",
  ).length;
  const pendingWithdrawalCount = withdrawals.filter(
    (w) => w.status === "PENDING",
  ).length;

  const userCount =
    stats?.users?.userCount ??
    (users.length ? users.filter((u) => u.role === "USER").length : undefined);
  const adminCount =
    stats?.users?.adminCount ??
    (users.length ? users.filter((u) => u.role === "ADMIN").length : undefined);

  const net =
    dep && wd
      ? Number(dep.completedAmount || 0) - Number(wd.completedAmount || 0)
      : undefined;

  const winners = results.filter((r) => r.result === "WIN");
  const losers = results.filter((r) => r.result === "LOSS");

  // prefer exact totals from the API; fall back to summing the loaded list
  const totalWon = totals
    ? totals.totalWon
    : winners.reduce((s, r) => s + Number(r.winAmount || 0), 0);
  const totalLost = totals
    ? totals.totalLost
    : losers.reduce((s, r) => s + Number(r.betAmount || 0), 0);
  const winCount = totals ? totals.winCount : winners.length;
  const lossCount = totals ? totals.lossCount : losers.length;

  const roleData = [
    { name: "Users", value: userCount || 0, color: C.violet },
    { name: "Admins", value: adminCount || 0, color: C.amber },
  ];
  const statusData = [
    {
      name: "Deposits",
      Pending: Number(dep?.pendingAmount || 0),
      Completed: Number(dep?.completedAmount || 0),
    },
    {
      name: "Withdrawals",
      Pending: Number(wd?.pendingAmount || 0),
      Completed: Number(wd?.completedAmount || 0),
    },
  ];
  const winLossData = [
    { name: "Won by users", value: totalWon, color: C.emerald },
    { name: "Lost by users", value: totalLost, color: C.red },
  ];

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    return users.filter(
      (u) =>
        (userFilter === "ALL" || u.role === userFilter) &&
        (!q || `${u.name} ${u.phone}`.toLowerCase().includes(q)),
    );
  }, [users, userFilter, userQuery]);

  const filteredResults = useMemo(() => {
    const q = wlQuery.trim().toLowerCase();
    return results
      .filter((r) => r.result === wlTab)
      .filter(
        (r) =>
          !q ||
          `${r.user?.name} ${r.user?.phone} ${r.period}`
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [results, wlTab, wlQuery]);

  /* ---------- guard ---------- */

  if (authorized !== true) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 text-slate-500">
        Checking access...
      </div>
    );
  }

  const badge = {
    deposits: pendingDepositCount,
    withdrawals: pendingWithdrawalCount,
  };
  const [title, subtitle] = TITLES[view];

  /* ---------- views ---------- */

  const dashboardView = (
    <div className="space-y-6">
      {/* money */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="amber"
          label="Pending deposits"
          value={inr(dep?.pendingAmount)}
          count={dep?.pendingCount ?? pendingDepositCount}
          urgent
          sub="waiting for approval"
          icon={I.clock({})}
        />
        <StatCard
          tone="emerald"
          label="Completed deposits"
          value={inr(dep?.completedAmount)}
          count={dep?.completedCount}
          sub="confirmed"
          icon={I.check({})}
        />
        <StatCard
          tone="amber"
          label="Pending withdrawals"
          value={inr(wd?.pendingAmount)}
          count={wd?.pendingCount ?? pendingWithdrawalCount}
          urgent
          sub="waiting to be paid"
          icon={I.clock({})}
        />
        <StatCard
          tone="red"
          label="Completed withdrawals"
          value={inr(wd?.completedAmount)}
          count={wd?.completedCount}
          sub="paid out"
          icon={I.check({})}
        />
      </div>

      {/* people + net */}
      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          tone="violet"
          label="Registered users"
          value={num(userCount)}
          sub="Role: USER"
          icon={I.users({})}
        />
        <StatCard
          tone="sky"
          label="Admins"
          value={num(adminCount)}
          sub="Role: ADMIN"
          icon={I.shield({})}
        />
        <StatCard
          hero
          label="Net inflow"
          value={inr(net)}
          sub="Completed deposits − completed withdrawals"
          icon={I.scale({})}
        />
      </div>

      {/* charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Deposits vs withdrawals"
          subtitle="Completed amounts, last 7 days"
          className="lg:col-span-2">
          <div className="h-72">
            {stats?.trend?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.trend}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={C.emerald}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor={C.emerald}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="gWd" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={C.violet}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={C.violet}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke={C.grid}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: C.axis, fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    }
                  />
                  <YAxis
                    tick={{ fill: C.axis, fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                  />
                  <Tooltip
                    formatter={(v) => inr(v)}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="deposits"
                    name="Deposits"
                    stroke={C.emerald}
                    strokeWidth={2.5}
                    fill="url(#gDep)"
                  />
                  <Area
                    type="monotone"
                    dataKey="withdrawals"
                    name="Withdrawals"
                    stroke={C.violet}
                    strokeWidth={2.5}
                    fill="url(#gWd)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty>No completed transactions in the last 7 days</Empty>
            )}
          </div>
        </Panel>

        <Panel title="Users by role" subtitle="Registered accounts">
          <div className="relative h-72">
            {userCount || adminCount ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={90}
                      paddingAngle={3}
                      stroke="none">
                      {roleData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-x-0 top-[38%] text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {num((userCount || 0) + (adminCount || 0))}
                  </p>
                  <p className="text-xs text-slate-400">total</p>
                </div>
              </>
            ) : (
              <Empty>No users yet</Empty>
            )}
          </div>
        </Panel>

        <Panel
          title="Pending vs completed"
          subtitle="Amount by status"
          className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                barGap={6}>
                <CartesianGrid
                  stroke={C.grid}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: C.axis, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: C.axis, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <Tooltip
                  formatter={(v) => inr(v)}
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="Pending"
                  fill={C.amber}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="Completed"
                  fill={C.violet}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Won vs lost" subtitle="Total across all games">
          <div className="h-64">
            {totalWon || totalLost ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={86}
                    paddingAngle={3}
                    stroke="none">
                    {winLossData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => inr(v)} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty>No game results yet</Empty>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );

  const txView = (kind) => {
    const isDep = kind === "deposits";
    const all = isDep ? deposits : withdrawals;

    const counts = { ALL: all.length, PENDING: 0, SUCCESS: 0, FAILED: 0 };
    all.forEach((x) => {
      counts[tabOf(x.status)] += 1;
    });

    const q = txQuery.trim().toLowerCase();
    const items = all.filter(
      (x) =>
        (txTab === "ALL" || tabOf(x.status) === txTab) &&
        (!q ||
          `${x.user?.name} ${x.user?.phone} ${x.referenceId || ""} ${x.description || ""}`
            .toLowerCase()
            .includes(q)),
    );

    const emptyText = {
      ALL: `No ${kind} yet`,
      PENDING: `No pending ${kind}`,
      SUCCESS: `No completed ${kind}`,
      FAILED: `No failed ${kind}`,
    }[txTab];

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Segmented
            value={txTab}
            onChange={setTxTab}
            options={[
              { id: "ALL", label: `All (${counts.ALL})` },
              {
                id: "PENDING",
                label: `Pending (${counts.PENDING})`,
                active: "text-amber-600",
              },
              {
                id: "SUCCESS",
                label: `Completed (${counts.SUCCESS})`,
                active: "text-emerald-600",
              },
              {
                id: "FAILED",
                label: `Failed (${counts.FAILED})`,
                active: "text-red-500",
              },
            ]}
          />
          <SearchBox
            value={txQuery}
            onChange={setTxQuery}
            placeholder="Search name, phone or UTR"
          />
        </div>

        <Table
          head={[
            "User",
            "Amount",
            isDep ? "UTR" : "Details",
            "Status",
            "Date",
            "",
          ]}
          isEmpty={items.length === 0}
          empty={emptyText}>
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/70">
              <td className="px-5 py-3.5">
                <UserCell user={item.user} />
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 font-bold">
                <span className={isDep ? "text-emerald-600" : "text-red-500"}>
                  {isDep ? "+" : "-"}
                  {inr(item.amount)}
                </span>
              </td>
              <td className="px-5 py-3.5 text-slate-600">
                {isDep ? item.referenceId || "—" : item.description || "—"}
              </td>
              <td className="px-5 py-3.5">
                <Badge tone={STATUS_TONE[item.status] || "slate"}>
                  {STATUS_LABEL[item.status] || item.status}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                {fmtDate(item.createdAt)}
              </td>
              <td className="px-5 py-3.5 text-right">
                {item.status === "PENDING" ? (
                  <ActionButton
                    busy={actingId === item.id}
                    onClick={() =>
                      isDep
                        ? handleConfirmDeposit(item.id)
                        : handleCompleteWithdrawal(item.id)
                    }>
                    {isDep ? "Confirm" : "Complete"}
                  </ActionButton>
                ) : (
                  <span className="text-xs text-slate-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </div>
    );
  };

  const usersView = (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          value={userFilter}
          onChange={setUserFilter}
          options={[
            { id: "ALL", label: `All (${users.length})` },
            { id: "USER", label: `Users (${userCount ?? 0})` },
            { id: "ADMIN", label: `Admins (${adminCount ?? 0})` },
          ]}
        />
        <SearchBox
          value={userQuery}
          onChange={setUserQuery}
          placeholder="Search name or phone"
        />
      </div>
      <Table
        head={["User", "Role", "Joined"]}
        isEmpty={filteredUsers.length === 0}
        empty="No users found">
        {filteredUsers.map((u) => (
          <tr key={u.id} className="hover:bg-slate-50/70">
            <td className="px-5 py-3.5">
              <UserCell user={u} />
            </td>
            <td className="px-5 py-3.5">
              <Badge tone={u.role === "ADMIN" ? "sky" : "violet"}>
                {u.role}
              </Badge>
            </td>
            <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
              {u.createdAt ? fmtDate(u.createdAt) : "—"}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );

  const isWin = wlTab === "WIN";
  const winLossView = (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="emerald"
          label="Total won"
          value={inr(totalWon)}
          sub="Paid out to winners"
          icon={I.trophy({})}
        />
        <StatCard
          tone="red"
          label="Total lost"
          value={inr(totalLost)}
          sub="Lost bets"
          icon={I.withdraw({})}
        />
        <StatCard
          tone="emerald"
          label="Winning bets"
          value={num(winCount)}
          icon={I.check({})}
        />
        <StatCard
          tone="red"
          label="Losing bets"
          value={num(lossCount)}
          icon={I.x({})}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          value={wlTab}
          onChange={setWlTab}
          options={[
            {
              id: "WIN",
              label: `Win (${winCount})`,
              active: "text-emerald-600",
            },
            {
              id: "LOSS",
              label: `Loss (${lossCount})`,
              active: "text-red-500",
            },
          ]}
        />
        <SearchBox
          value={wlQuery}
          onChange={setWlQuery}
          placeholder="Search user or game ID"
        />
      </div>

      <Table
        head={["User", "Game ID", "Bet", isWin ? "Won" : "Lost", "Date"]}
        isEmpty={filteredResults.length === 0}
        empty={isWin ? "No winning bets yet" : "No losing bets yet"}>
        {filteredResults.map((r) => (
          <tr key={r.id} className="hover:bg-slate-50/70">
            <td className="px-5 py-3.5">
              <UserCell user={r.user} />
            </td>
            <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-slate-600">
              #{r.period}
            </td>
            <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
              {inr(r.betAmount)}
            </td>
            <td className="whitespace-nowrap px-5 py-3.5 font-bold">
              <span className={isWin ? "text-emerald-600" : "text-red-500"}>
                {isWin ? "+" : "-"}
                {inr(isWin ? r.winAmount : r.betAmount)}
              </span>
            </td>
            <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
              {fmtDate(r.createdAt)}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );

  const body = loading ? (
    <Empty>Loading...</Empty>
  ) : view === "dashboard" ? (
    dashboardView
  ) : view === "deposits" ? (
    txView("deposits")
  ) : view === "withdrawals" ? (
    txView("withdrawals")
  ) : view === "users" ? (
    usersView
  ) : (
    winLossView
  );

  /* ---------- shell: sidebar + topbar ---------- */

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      {/* mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}>
        <div className="flex h-16 items-center gap-2.5 px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/30">
            {I.shield({ className: "h-5 w-5" })}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">Admin Panel</p>
            <p className="text-[11px] text-slate-400">Control center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((n) => {
            const active = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => {
                  setView(n.id);
                  setTxTab("ALL");
                  setTxQuery("");
                  setMenuOpen(false);
                }}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                ].join(" ")}>
                {n.icon({
                  className: `h-[18px] w-[18px] ${active ? "text-violet-600" : ""}`,
                })}
                <span className="flex-1 text-left">{n.label}</span>
                {badge[n.id] > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                    {badge[n.id]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50">
            {I.logout({ className: "h-[18px] w-[18px]" })}
            Logout
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="lg:pl-64">
        {/* topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl sm:px-8">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden">
            {I.menu({})}
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight">
              {title}
            </h1>
            <p className="hidden truncate text-xs text-slate-400 sm:block">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                {(me?.name || "A").charAt(0).toUpperCase()}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{me?.name || "Admin"}</p>
                <p className="text-[11px] text-slate-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-500 shadow-sm transition-colors hover:bg-red-50">
              {I.logout({ className: "h-4 w-4" })}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8">{body}</main>
      </div>
    </div>
  );
}
