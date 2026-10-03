export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// Change "token" if your login stores the JWT under another key.
export const getToken = () =>
    typeof window === "undefined" ? null : localStorage.getItem("token");

async function request(path, options = {}) {
    try {
        const token = getToken();
        const res = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        });
        return await res.json();
    } catch {
        return { ok: false, reason: "Network error. Please try again." };
    }
}

export const api = {
    getWallet: () => request("/api/wallet"),
    getState: (mode) => request(`/api/game/state/${mode}`),
    placeBet: (body) => request("/api/game/bet", { method: "POST", body: JSON.stringify(body) }),
    myBets: (mode, page = 1) =>
        request(`/api/game/my-bets?page=${page}${mode ? `&mode=${mode}` : ""}`),
};