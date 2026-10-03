'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * lib/store/bankStore.js
 * Persisted to localStorage so bank details survive page reloads on this
 * device without needing a backend yet. Once you build a real endpoint
 * for this, swap this for: fetch details on load, POST/PATCH to save —
 * the server becomes the source of truth instead of the browser, and
 * `persist` can be removed.
 */
export const useBankStore = create(
    persist(
        (set) => ({
            bankDetails: null, // { bankName, accountNumber, ifsc, holderName } | null
            setBankDetails: (details) => set({ bankDetails: details }),
        }),
        { name: 'wallet-bank-details' }
    )
);