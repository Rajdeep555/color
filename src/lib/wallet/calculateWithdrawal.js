/**
 * lib/wallet/calculateWithdrawal.js
 * Fee is added ON TOP of the amount the user enters (the amount they want
 * to actually receive). Entering ₹100 requires ₹111 in balance:
 * fee = 100 * 0.11 = 11, total deducted = 100 + 11 = 111.
 */
export const WITHDRAWAL_FEE_RATE = 0.11;

export function calculateWithdrawal(amount) {
    const numeric = Number(amount) || 0;
    const fee = Math.round(numeric * WITHDRAWAL_FEE_RATE * 100) / 100;
    const total = Math.round((numeric + fee) * 100) / 100;
    return { fee, total };
}