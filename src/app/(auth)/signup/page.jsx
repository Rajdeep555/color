"use client";

import { forwardRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validations/auth";

/* ------------------------------------------------------------------ */
/* icons                                                               */
/* ------------------------------------------------------------------ */

const Svg = ({ children, className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true">
    {children}
  </svg>
);

const Icons = {
  user: (
    <Svg>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </Svg>
  ),
  mail: (
    <Svg>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </Svg>
  ),
  phone: (
    <Svg>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </Svg>
  ),
  lock: (
    <Svg>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </Svg>
  ),
  eye: (
    <Svg>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  ),
  eyeOff: (
    <Svg>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7c1.5 0 2.9-.4 4.1-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Svg>
  ),
  alert: (
    <Svg className="h-4 w-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </Svg>
  ),
  shield: (
    <Svg className="h-4 w-4">
      <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  ),
  bolt: (
    <Svg className="h-4 w-4">
      <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
    </Svg>
  ),
};

/* ------------------------------------------------------------------ */
/* ui pieces                                                           */
/* ------------------------------------------------------------------ */

const Field = forwardRef(function Field(
  { label, icon, error, prefix, type = "text", ...props },
  ref,
) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-violet-200/70">
        {label}
      </label>
      <div
        className={[
          "group flex items-center gap-3 rounded-2xl border bg-white/[0.04] px-4 transition-all",
          "focus-within:bg-white/[0.07] focus-within:ring-4",
          error
            ? "border-red-500/60 focus-within:border-red-400 focus-within:ring-red-500/15"
            : "border-white/10 focus-within:border-yellow-300/70 focus-within:ring-yellow-300/10",
        ].join(" ")}>
        <span
          className={
            error
              ? "text-red-400"
              : "text-violet-300/60 transition-colors group-focus-within:text-yellow-300"
          }>
          {icon}
        </span>

        {prefix && (
          <span className="border-r border-white/10 pr-3 text-sm font-bold text-white/80">
            {prefix}
          </span>
        )}

        <input
          ref={ref}
          type={isPassword && show ? "text" : type}
          className="w-full bg-transparent py-3.5 text-[15px] font-medium text-white outline-none placeholder:text-white/25"
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="text-violet-300/60 transition-colors hover:text-white">
            {show ? Icons.eyeOff : Icons.eye}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-400">
          {Icons.alert}
          {error}
        </p>
      )}
    </div>
  );
});

function Ball({ color, label, delay }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={`animate-bounce h-7 w-7 rounded-full shadow-lg ring-2 ring-white/20 ${color}`}
        style={{ animationDelay: delay, animationDuration: "2.2s" }}
      />
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(
          result.message || "Something went wrong. Please try again.",
        );
        return;
      }

      router.push("/login");
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0518] px-5 py-10 text-white">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/30 blur-[110px]" />
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-rose-500/15 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md">
        {/* brand */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 text-2xl font-black italic text-[#2a1200] shadow-[0_8px_30px_rgba(251,191,36,0.45)] ring-2 ring-white/30">
              91
            </span>
            <div className="text-left leading-none">
              <p className="bg-gradient-to-r from-white via-yellow-200 to-amber-300 bg-clip-text text-3xl font-black italic tracking-tight text-transparent">
                LEAGUE
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-violet-300/70">
                Color Prediction
              </p>
            </div>
          </div>

          <div className="mx-auto mt-6 flex w-fit items-end gap-7">
            <Ball
              color="bg-gradient-to-br from-rose-400 to-red-600"
              label="Red"
              delay="0s"
            />
            <Ball
              color="bg-gradient-to-br from-emerald-300 to-green-600"
              label="Green"
              delay="0.25s"
            />
            <Ball
              color="bg-gradient-to-br from-violet-400 to-purple-700"
              label="Violet"
              delay="0.5s"
            />
          </div>
        </div>

        {/* card */}
        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-violet-200/70">
              Join <span className="font-bold text-yellow-300">91 League</span>{" "}
              and start predicting in seconds.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate>
            <Field
              label="Full Name"
              icon={Icons.user}
              placeholder="Alice Smith"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Field
              label="Email"
              type="email"
              icon={Icons.mail}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Field
              label="Phone"
              type="tel"
              icon={Icons.phone}
              prefix="+91"
              placeholder="9876543210"
              autoComplete="tel-national"
              inputMode="numeric"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Field
              label="Password"
              type="password"
              icon={Icons.lock}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Field
              label="Confirm Password"
              type="password"
              icon={Icons.lock}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {serverError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
                <span className="mt-0.5">{Icons.alert}</span>
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative mt-2 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 py-4 text-base font-black uppercase tracking-wider text-[#2a1200] shadow-[0_10px_30px_rgba(251,191,36,0.35)] transition-all hover:shadow-[0_14px_40px_rgba(251,191,36,0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2a1200]/30 border-t-[#2a1200]" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-violet-200/70">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-bold text-yellow-300 underline-offset-4 hover:underline">
              Login
            </button>
          </p>
        </div>

        {/* trust row */}
        <div className="mt-6 flex items-center justify-center gap-5 text-[11px] font-semibold text-violet-200/60">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">{Icons.shield}</span>
            Secure signup
          </span>
          <span className="h-3 w-px bg-white/15" />
          <span className="flex items-center gap-1.5">
            <span className="text-yellow-300">{Icons.bolt}</span>
            Instant access
          </span>
        </div>

        <p className="mt-4 text-center text-[10px] leading-relaxed text-white/30">
          18+ only. Play responsibly. By signing up you agree to our terms of
          use.
        </p>
      </div>
    </div>
  );
}
