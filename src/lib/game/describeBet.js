/**
 * lib/game/describeBet.js
 * Turns a bet object into a short, readable label — used in both the
 * placement toast and the "My History" list, so the wording stays
 * consistent everywhere a bet is described.
 */
export function describeBet(bet) {
    if (bet.type === 'color') {
        const label = bet.value.charAt(0).toUpperCase() + bet.value.slice(1);
        return label;
    }
    if (bet.type === 'number') {
        return `Number ${bet.value}`;
    }
    if (bet.type === 'bigsmall') {
        return bet.value === 'big' ? 'Big (5–9)' : 'Small (0–4)';
    }
    return bet.type;
}