'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDepositsPage() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(null); // null = checking
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmingId, setConfirmingId] = useState(null);

    useEffect(() => {
        fetch('/api/user/me')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.user?.role === 'ADMIN') {
                    setAuthorized(true);
                    loadDeposits();
                } else {
                    setAuthorized(false);
                    router.push('/home');
                }
            })
            .catch(() => {
                setAuthorized(false);
                router.push('/login');
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadDeposits = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/deposits');
        if (res.ok) {
            const data = await res.json();
            setDeposits(data.deposits);
        }
        setLoading(false);
    };

    const handleConfirm = async (id) => {
        setConfirmingId(id);
        try {
            const res = await fetch(`/api/admin/deposits/${id}/confirm`, { method: 'POST' });
            if (res.ok) {
                setDeposits((prev) => prev.filter((d) => d.id !== id));
            }
        } finally {
            setConfirmingId(null);
        }
    };

    if (authorized !== true) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#0b0518] text-slate-400">
                Checking access...
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-[#0b0518] px-6 py-8 text-white">
            <h1 className="mb-6 text-2xl font-bold">Pending Deposits</h1>

            {loading ? (
                <p className="text-slate-400">Loading...</p>
            ) : deposits.length === 0 ? (
                <p className="text-slate-400">No pending deposits.</p>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">UTR</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {deposits.map((d) => (
                                <tr key={d.id} className="border-t border-white/5">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-white">{d.user.name}</p>
                                        <p className="text-xs text-slate-500">{d.user.phone}</p>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-yellow-300">
                                        ₹{Number(d.amount).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">{d.referenceId}</td>
                                    <td className="px-4 py-3 text-slate-400">
                                        {new Date(d.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleConfirm(d.id)}
                                            disabled={confirmingId === d.id}
                                            className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                                        >
                                            {confirmingId === d.id ? 'Confirming...' : 'Confirm'}
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