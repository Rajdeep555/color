/**
 * lib/wallet/upiAccounts.js
 * Maps each QR account option to its real UPI payment details.
 *
 * REPLACE these placeholder VPAs with your actual registered UPI IDs
 * before going live — the QR/deep link only works if `pa` is real.
 */
export const UPI_ACCOUNTS = {
    vip01: { vpa: '6002130320@nyes', payeeName: 'VIP 01' },
    vvip001: { vpa: 'vvip001@upi', payeeName: 'VVIP 001' },
    vip02: { vpa: 'vip02@upi', payeeName: 'VIP 02' },
};

export function generateTransactionRef() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase();
    }
    return `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

export function buildUpiUri({ account, amount, transactionRef }) {
    const info = UPI_ACCOUNTS[account];
    if (!info) return null;

    const params = new URLSearchParams({
        pa: info.vpa,
        pn: info.payeeName,
        am: String(amount),
        cu: 'INR',
        tn: `Deposit ${transactionRef}`,
        tr: transactionRef,
    });

    return `upi://pay?${params.toString()}`;
}