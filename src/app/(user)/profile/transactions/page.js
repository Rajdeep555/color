'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';

const TABS = [
    { id: 'CREDIT', label: 'Deposits' },
    { id: 'DEBIT', label: 'Withdrawals' },
];

const STATUS_STYLE = {
    PENDING: 'bg-amber-500/15 text-amber-400',
    SUCCESS: 'bg-emerald-500/15 text-emerald-400',
    FAILED: 'bg-red-500/15 text-red-400',
    CANCELLED: 'bg-slate-500/15 text-slate-400',
    REFUNDED: 'bg-sky-500/15 text-sky-400',
};

export default function TransactionsPage() {
    const [tab, setTab] = useState('CREDIT');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/wallet/transactions?type=${tab}`)
            .then((res) => (res.ok ? res.json() : { transactions: [] }))
            .then((data) => setItems(data.transactions))
            .finally(() => setLoading(false));
    }, [tab]);

    return (
        <div className="relative min-h-dvh overflow-hidden bg-[#0b0518] px-4 pb-10 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(147,51,234,0.25),transparent_55%)]" />

            <div className="relative z-10">
                <PageHeader title="Transaction History" />

                <div className="mb-4 flex gap-2">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={[
                                'flex-1 rounded-full py-2 text-sm font-semibold transition-colors',
                                tab === t.id
                                    ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white'
                                    : 'bg-white/5 text-slate-400',
                            ].join(' ')}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p className="py-10 text-center text-sm text-slate-400">Loading...</p>
                ) : items.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">
                        No {tab === 'CREDIT' ? 'deposits' : 'withdrawals'} yet.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {items.map((txn) => (
                            <div
                                key={txn.id}
                                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                            >
                                <div>
                                    <p className={`text-sm font-bold ${tab === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {tab === 'CREDIT' ? '+' : '-'}₹{Number(txn.amount).toLocaleString()}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                        {new Date(txn.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${STATUS_STYLE[txn.status]}`}
                                >
                                    {txn.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}