# Product Requirements Document: Color Prediction Game Platform

**Version:** 1.0
**Model:** Virtual in-app currency only — no real-money deposits or withdrawals

---

## 1. Overview

A round-based prediction game where users stake virtual coins on the outcome of a color (and/or number) draw. Users earn or purchase coins for entertainment purposes; there is no cash-out. The platform includes a public-facing web app and an internal admin panel for monitoring users, coin transactions, and round activity.

**Why virtual currency:** Real-money color prediction games fall under gambling regulations in most Indian states and require specific state-level licensing that is slow, expensive, and geographically limited. Virtual currency lets you build and validate the same game mechanics and real-time engine without that legal exposure. Monetization instead comes from coin purchase packs, ads, or cosmetic/subscription features.

---

## 2. Goals

- Deliver a fast, trustworthy, real-time prediction game
- Give users clear, transparent odds and history
- Give admins full visibility into users, coin economy, and round integrity
- Build on an architecture that could later support a licensed real-money mode without a rewrite

---

## 3. User Roles

| Role                                  | Access                                                               |
| ------------------------------------- | -------------------------------------------------------------------- |
| Player                                | Sign up, buy/earn coins, place bets, view history/leaderboard        |
| Admin                                 | Full dashboard, user management, transaction ledger, round oversight |
| Support/Moderator (optional, phase 2) | View-only user lookup, can freeze accounts, cannot touch round logic |

---

## 4. Core Game Flow (Round Lifecycle)

1. **Round Created** — Server creates a new round with a unique ID and a fixed betting window (e.g., 30s or 60s).
2. **Betting Open** — Countdown shown to all connected users via a synced server timestamp (not a client-side timer). Users pick Red / Green / Violet (or a number 0–9) and a coin stake.
3. **Betting Locked** — At T-0, no further bets accepted. Server has already generated the result server-side (sealed before bets close, or via a provably-fair seed committed at round start) so no result can be influenced by incoming bets.
4. **Result Reveal** — Result broadcast to all clients simultaneously via WebSocket, animated client-side.
5. **Settlement** — Server calculates payouts per user, updates wallet balances atomically, writes to the ledger.
6. **History Update** — Round result and payout summary appended to public round history and each user's personal history.
7. **Next Round** — New round auto-starts after a short cooldown (e.g., 5s).

**Payout logic (example):**

- Red / Green: 2x payout, ~45% probability each
- Violet: 4.5x payout, ~10% probability
- Number bet (0–9): 9x payout, ~10% probability each

Exact odds should be tuned so the platform retains a small "house edge" in coins even though coins have no cash value — this keeps the coin economy sustainable and prevents runaway inflation.

---

## 5. Functional Requirements — Player App

- **Auth:** Email/phone + OTP or password; session via JWT or NextAuth
- **Wallet:** Coin balance always visible; purchase coin packs (via app store IAP or a payment gateway if you sell coins for real money — this is legal since coins aren't withdrawable, similar to mobile game currency)
- **Game screen:** Live round timer, color/number selection, stake input, live bet count/pool size (optional, adds excitement), animated result reveal
- **History:** Personal bet history, past round results, win/loss record
- **Leaderboard:** Top winners (daily/weekly), optional
- **Profile:** Basic info, coin purchase history, referral code (optional growth lever)

---

## 6. Functional Requirements — Admin Panel

- **Dashboard (live):** Active users right now, current round status, total coins staked this round, rounds played today, coin purchases today
- **User management:** Search/filter users, view individual wallet + bet history, freeze/ban account, manually adjust coin balance (with audit log of who did it and why)
- **Transaction ledger:** Every coin movement — purchases, bets placed, payouts, admin adjustments — filterable by user/date/type, exportable
- **Round history & audit:** Every round's result, the seed/method used to generate it, total staked, total paid out, house edge realized — this is your fairness audit trail
- **Coin economy controls:** Adjust payout multipliers, adjust coin pack pricing, pause the game platform-wide
- **Alerts:** Flag unusual patterns (e.g., a single account winning suspiciously often — useful even in a virtual-currency game to catch bugs or exploit attempts)

---

## 7. Data Model (conceptual)

- **User** — id, contact info, auth credentials, status (active/frozen), created_at
- **Wallet** — user_id, coin_balance, updated_at
- **Transaction** — id, user_id, type (purchase / bet / payout / admin_adjustment), amount, related_round_id (nullable), created_at
- **Round** — id, status, start_time, lock_time, result, seed/commitment hash, total_staked, total_paid_out, created_at
- **Bet** — id, user_id, round_id, choice (color/number), stake, payout_multiplier, outcome (win/loss), created_at
- **CoinPack** — id, name, coin_amount, price, active
- **AdminActionLog** — id, admin_id, action_type, target_user_id (nullable), details, created_at

Transactions and Bets should never be updated in place — always append-only, so the ledger is a reliable audit trail.

---

## 8. Tech Architecture

- **Frontend:** Next.js (App Router), Tailwind for styling, separate route groups for player app vs admin panel with role-gated middleware
- **Backend:** Next.js Server Actions / API routes for bet placement, wallet operations, and admin actions; keep all payout math server-side, never trust client input for outcomes
- **Primary database:** PostgreSQL via Prisma — wallets, transactions, bets, rounds, users. Chosen for ACID guarantees so coin balances can never double-deduct or go inconsistent under concurrent bets
- **Real-time layer:** Redis for current round state, countdown sync, and pub/sub; Socket.io (or a managed alternative like Pusher/Ably) for pushing round events, countdowns, and results to connected clients
- **Background jobs:** A scheduler (cron or a queue like BullMQ backed by Redis) to run the round lifecycle — create round, lock betting, generate result, settle payouts — independent of any single user's request
- **Hosting:** Vercel for the Next.js app, a managed Postgres (Neon/Supabase/RDS), managed Redis (Upstash/Redis Cloud)

---

## 9. Real-Time & Scaling Notes

- Round timers must be driven by server timestamps (`lockTime`, `resultTime`), not client-side `setTimeout`, to avoid drift across devices
- All server instances should subscribe to the same Redis pub/sub channel for round events, so the system can scale horizontally without users seeing inconsistent state
- Rate-limit bet placement per user per round to prevent double-submits
- Consider optimistic UI for bet placement confirmation, but never optimistic UI for the result itself

---

## 10. Fairness & Trust

- Even without real money, perceived fairness drives retention. Consider a "provably fair" approach: generate a server seed, publish its hash before the round opens, then reveal the seed after the round closes so users can independently verify the result wasn't changed after bets came in
- Keep an immutable round/result audit log (see Admin Panel section) so any dispute can be checked against real data
- Publish odds/probabilities somewhere visible — don't hide them

---

## 11. Monetization (non-gambling)

- Sell coin packs (real payment, but coins are not withdrawable — same model as most mobile games)
- Rewarded ads for small coin bonuses
- Optional cosmetic purchases (profile themes, avatars) or a subscription for perks (daily bonus coins, ad-free)

---

## 12. Phased Build Plan

**Phase 1 — Core loop (2–3 weeks)**

- Auth, wallet, single round type (color only), manual round trigger, basic result reveal, Postgres schema

**Phase 2 — Real-time & automation (1–2 weeks)**

- WebSocket integration, Redis-backed round scheduler, auto-running rounds, synced countdowns

**Phase 3 — Admin panel (1–2 weeks)**

- Dashboard, user management, transaction ledger, round audit log

**Phase 4 — Economy & polish (1–2 weeks)**

- Coin purchase flow, number betting, leaderboard, animations, rate limiting, fairness seed system

**Phase 5 — Hardening**

- Load testing the real-time layer, abuse/exploit testing, admin alerting

---

## 13. Success Metrics

- Daily/weekly active users
- Average session length, rounds played per user
- Coin pack conversion rate
- Round settlement latency (should be near-instant)
- Zero wallet-balance inconsistencies (tracked via ledger reconciliation)

---

## 14. Open Questions / Risks

- If real money is considered later: requires state-specific gambling license, KYC/AML flows, payment gateway compliance, and legal review — treat as a separate project, not an incremental feature
- Coin inflation: needs a sustainable sink (bets lost) vs source (purchases/bonuses) balance, monitored via the admin dashboard
- Abuse vectors: multi-accounting to farm free coin bonuses, bot betting — plan basic device/IP heuristics in the admin alerting



<!-- folder stucture -->
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.js
│   │       ├── signup/
│   │       │   └── route.js
│   │       └── logout/
│   │           └── route.js
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.jsx
│   │   ├── register/
│   │   │   └── page.jsx
│   │   └── forgot-password/
│   │       └── page.jsx
│   │
│   ├── (user)/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   ├── dashboard/
│   │   │   └── page.jsx
│   │   ├── profile/
│   │   │   └── page.jsx
│   │   ├── wallet/
│   │   │   └── page.jsx
│   │   └── transactions/
│   │       └── page.jsx
│   │
│   ├── layout.jsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── Loader.jsx
│   │
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   │
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── BottomNav.jsx
│   │   └── Sidebar.jsx
│   │
│   └── user/
│       ├── UserCard.jsx
│       └── WalletCard.jsx
│
├── store/
│   ├── authStore.js
│   └── userStore.js
│
├── lib/
│   ├── prisma.js
│   ├── api.js
│   ├── auth/
│   │   └── jwt.js
│   └── validations/
│       └── auth.js
│
└── generated/
    └── prisma/