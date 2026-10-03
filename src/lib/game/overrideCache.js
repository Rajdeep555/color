import { prisma } from '@/lib/prisma';

/**
 * lib/game/overrideCache.js
 * Every player's browser asks for the same override. This keeps the answer in
 * memory for 2 seconds and shares one in-flight query between simultaneous
 * requests, so 1000 players = 1 DB query per 2 seconds per duration.
 */

const TTL_MS = 2_000;
const g = globalThis;
const store = g.__overrideCache ?? (g.__overrideCache = new Map());

export async function getOverride(duration) {
    const hit = store.get(duration);
    if (hit && hit.value !== undefined && hit.exp > Date.now()) return hit.value;
    if (hit?.pending) return hit.pending;

    const pending = prisma.roundOverride
        .findUnique({ where: { roundDuration: duration } })
        .then((value) => {
            store.set(duration, { value, exp: Date.now() + TTL_MS });
            return value;
        })
        .catch((err) => {
            store.delete(duration);
            throw err;
        });

    store.set(duration, { pending, exp: 0 });
    return pending;
}

/** Call after admin sets or clears an override so players see it immediately. */
export function clearOverrideCache(duration) {
    if (duration === undefined) store.clear();
    else store.delete(Number(duration));
}