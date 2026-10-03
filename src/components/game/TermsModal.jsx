"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

const PLATFORM = "91 League";
const SUPPORT = "support@yourdomain.com"; // TODO: replace with your real support address
const UPDATED = "3 October 2026"; // TODO: update when you change the terms

const SECTIONS = [
  {
    title: "Acceptance of these terms",
    paras: [
      `These Terms & Conditions ("Terms") govern your use of ${PLATFORM} (the "Platform") and every bet you place on it. By creating an account, adding money, or placing a bet, you confirm that you have read, understood and agreed to these Terms.`,
      "If you do not agree with any part of these Terms, do not use the Platform.",
    ],
  },
  {
    title: "Eligibility",
    list: [
      "You must be at least 18 years old and able to enter into a binding contract.",
      "You must not live in, or access the Platform from, any place where online games involving money are prohibited.",
      "You may hold only one account. Accounts cannot be shared, sold or transferred.",
      "We may ask for identity and age verification at any time and may restrict your account until it is completed.",
    ],
  },
  {
    title: "Your responsibility to follow the law",
    paras: [
      "Laws on online games and betting differ between countries and Indian states, and some prohibit them. You alone are responsible for checking that your use of the Platform is lawful where you live.",
      `${PLATFORM} does not accept responsibility for any consequence of you using the Platform where it is not permitted.`,
    ],
  },
  {
    title: "Your account",
    list: [
      "Keep your login details private. Everything done through your account is treated as done by you.",
      "Tell us immediately if you suspect someone else has used your account.",
      "Give accurate information. Wrong details can delay or block withdrawals.",
      "We may suspend or close an account that breaks these Terms or the law.",
    ],
  },
  {
    title: "Deposits",
    paras: [
      "Money you add to your wallet is used to place bets. Deposits are final once credited and are not refundable. Your available balance can only be taken out through a withdrawal request under section 9.",
      "If a payment fails, is duplicated or is credited incorrectly, contact support with your transaction reference. We will review it and correct it where the error is verified.",
    ],
  },
  {
    title: "How betting works",
    list: [
      "Each round has a Game ID and a countdown. You can bet on a color, on Big or Small, or on a number.",
      "The amount you pay for a bet is the amount you select multiplied by the multiplier you select. The total is shown before you confirm.",
      "Payouts are made at the rates shown in the game for that type of bet.",
      "Betting closes in the last 5 seconds of every round. Bets cannot be placed after that.",
      "You may place several bets in a round, but each option can be booked only once per round.",
    ],
  },
  {
    title: "Rounds and results",
    paras: [
      "The result of a round is the one shown by the Platform for that Game ID after the countdown ends. Our records of bets, rounds and results are final and binding unless a verified technical error is found.",
    ],
    list: [
      "A bet wins only if it matches the result shown for its round.",
      "Winnings are credited to your wallet after the round is settled.",
      "You are responsible for checking your bet history.",
    ],
  },
  {
    title: "All bets are final: no cancellations or refunds",
    paras: [
      "Once you tap Confirm bet, the bet is final. It cannot be cancelled, changed, reversed or refunded for any reason, including choosing the wrong option, amount or multiplier.",
    ],
    list: [
      "Money lost on a bet is not refundable.",
      "Deposits are not refundable (see section 5).",
      "No refund or compensation is given for a change of mind, for losses, or for bets placed by mistake or under the influence of alcohol or other substances.",
      "The only exceptions are: rounds we void because of a verified technical fault, duplicate or failed payments that we confirm, and cases where the law requires a refund.",
    ],
  },
  {
    title: "Winnings and withdrawals",
    list: [
      "You can withdraw only your available balance.",
      "We may require identity, address and payment-account verification before any withdrawal.",
      "Withdrawals are paid only to a bank account or UPI ID in your own name.",
      "Processing can take several working days. We may delay a withdrawal while we review it for security, fraud or legal reasons.",
      "Minimum and maximum withdrawal limits may apply and can change.",
      "You are responsible for any tax on your winnings. We may deduct tax where the law requires it.",
    ],
  },
  {
    title: "Technical problems",
    paras: [
      "The Platform depends on internet connections, devices and third-party services that we do not control. We are not responsible for bets that are missed, delayed or not registered because of your connection, your device, or because the app was closed.",
      "If a fault in the Platform affects a round, we may void the round and return the amount of the affected bets to your wallet. This is your only remedy for a technical fault.",
    ],
  },
  {
    title: "Prohibited conduct",
    paras: [
      "If we find or reasonably suspect any of the following, we may cancel bets, suspend or close your account, and hold your balance as far as the law allows:",
    ],
    list: [
      "Opening multiple accounts or using another person's account.",
      "Using bots, scripts or automated tools, or exploiting bugs.",
      "Colluding with others or trying to manipulate rounds, results or payments.",
      "Using stolen cards, accounts or payment details, or money from illegal sources.",
      "Chargebacks or false payment disputes.",
      "Abusing or harassing our staff or other users.",
    ],
  },
  {
    title: "Risk warning and responsible play",
    paras: [
      "Betting carries a real risk of losing some or all of the money you bet. Nothing on the Platform is a promise or guarantee of winnings. Only bet money you can afford to lose.",
    ],
    list: [
      "Never bet with borrowed money or money you need for essentials.",
      "Set a limit for yourself and stop when you reach it.",
      "Take regular breaks and do not chase losses.",
      "If betting is causing you stress or financial harm, stop and talk to someone you trust or a qualified counsellor. You can ask us to close your account at any time.",
    ],
  },
  {
    title: "Limitation of liability",
    paras: [
      "To the fullest extent allowed by law, the Platform and its owners, staff and partners are not liable for any loss of money, profit or opportunity, or for any indirect or consequential loss, arising from your use of the Platform.",
      "Our total liability to you for any claim is limited to the balance in your wallet at the time the claim arose. Nothing in these Terms limits liability that cannot be limited by law.",
    ],
  },
  {
    title: "Privacy",
    paras: [
      "We collect and use your personal information (such as name, phone number, email, payment details and activity) to run your account, verify your identity, process payments, prevent fraud and meet legal duties. We share it only with payment and verification providers, and with authorities where the law requires.",
    ],
  },
  {
    title: "Changes, suspension and closing",
    list: [
      "We may change these Terms at any time. The new version applies once it is published, and continuing to use the Platform means you accept it.",
      "We may suspend, limit or end the Platform or your access at any time.",
      "You may ask to close your account at any time. Any available balance will be paid out under section 9 after verification.",
    ],
  },
  {
    title: "Complaints and disputes",
    paras: [
      `If you have a problem with a bet, a payment or a withdrawal, contact ${SUPPORT} within 7 days and include your Game ID or transaction reference. Late complaints may not be considered.`,
      "These Terms are governed by the laws of India. Any dispute is subject to the courts at the location of the Platform operator's registered office.",
    ],
  },
];

export default function TermsModal({ open, onClose, onAccept }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#1a1226] sm:h-[80dvh] sm:rounded-3xl">
            {/* header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <h2
                  id="terms-title"
                  className="text-base font-semibold text-white">
                  Terms &amp; Conditions
                </h2>
                <p className="mt-0.5 text-xs text-white/45">
                  Last updated {UPDATED}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close terms and conditions"
                className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-white/70 [color-scheme:dark] [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin]">
              <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2.5 text-amber-100/90">
                Please read these Terms carefully. Bets are final and deposits
                are not refundable. Betting involves the risk of losing money.
                Only for players aged 18 and over.
              </p>

              {SECTIONS.map((s, i) => (
                <section key={s.title}>
                  <h3 className="mb-1.5 text-sm font-semibold text-white">
                    {i + 1}. {s.title}
                  </h3>
                  {s.paras?.map((p) => (
                    <p key={p} className="mb-2 last:mb-0">
                      {p}
                    </p>
                  ))}
                  {s.list && (
                    <ul className="list-disc space-y-1 pl-5 marker:text-white/30">
                      {s.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {/* footer */}
            <div
              className="border-t border-white/10 p-4"
              style={{
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              }}>
              <button
                type="button"
                onClick={() => {
                  onAccept?.();
                  onClose();
                }}
                className="h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
                {onAccept ? "I agree" : "Close"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
