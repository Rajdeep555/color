"use client";

import { useRouter } from "next/navigation";

export default function PageHeader({ title }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 px-1 pb-4 pt-5">
      <button
        onClick={() => router.back()}
        aria-label="Back"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 className="text-lg font-bold text-white">{title}</h1>
    </div>
  );
}
