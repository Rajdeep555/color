"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const ICON = {
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
};

const TABS = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0f0a19]/90 backdrop-blur-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-1 pb-2.5 pt-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-400">
              {active && (
                <span className="absolute inset-x-0 top-0 flex justify-center">
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="h-0.5 w-10 rounded-b-full bg-violet-400"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                </span>
              )}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`transition-colors ${
                  active ? "text-violet-300" : "text-white/40"
                }`}>
                {ICON[tab.icon]}
              </svg>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  active ? "text-white" : "text-white/45"
                }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
