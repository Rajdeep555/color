'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import PageHeader from '@/components/layout/PageHeader';
import BankDetailsForm from '@/components/wallet/BankDetailsForm';
import WithdrawAmountForm from '@/components/wallet/WithdrawAmountForm';
import WithdrawHistory from '@/components/wallet/WithdrawHistory';

export default function WithdrawPage() {
    const credits = useGameStore((s) => s.credits);
    const withdrawHistory = useGameStore((s) => s.withdrawHistory);

    const [bankDetails, setBankDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingBank, setEditingBank] = useState(false);

    useEffect(() => {
        fetch('/api/user/bank-details')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setBankDetails(data?.bankDetail || null))
            .finally(() => setLoading(false));
    }, []);

    const handleSaveBank = async (values) => {
        const res = await fetch('/api/user/bank-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });
        if (res.ok) {
            const data = await res.json();
            setBankDetails(data.bankDetail);
            setEditingBank(false);
        }
    };

    const needsBankDetails = !bankDetails || editingBank;

    return (
        <div className="relative min-h-dvh overflow-hidden bg-[#0b0518] px-4 pb-10 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(147,51,234,0.25),transparent_55%)]" />

            <div className="relative z-10">
                <PageHeader title="Withdraw" />

                {loading ? (
                    <p className="py-10 text-center text-sm text-slate-400">Loading...</p>
                ) : needsBankDetails ? (
                    <BankDetailsForm initialValues={bankDetails} onSave={handleSaveBank} />
                ) : (
                    <>
                        <WithdrawAmountForm
                            credits={credits}
                            bankDetails={bankDetails}
                            onEditBank={() => setEditingBank(true)}
                        />
                        <WithdrawHistory history={withdrawHistory} />
                    </>
                )}
            </div>
        </div>
    );
}