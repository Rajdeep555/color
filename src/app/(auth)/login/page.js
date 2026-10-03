"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { loginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(
          result.message || "Invalid credentials. Please try again.",
        );
        return;
      }

      // route based on role — this is the piece that was missing
      router.push(result.user.role === "ADMIN" ? "/admin" : "/home");
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-[#0b0518] px-6 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(147,51,234,0.25),transparent_60%)]" />

      <div className="relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold italic tracking-tight">
            WELCOME BACK
          </h1>
          <p className="mt-2 text-sm font-medium text-yellow-300">
            Login to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate>
          <InputField
            label="Phone"
            placeholder="9876543210"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          {serverError && (
            <p className="text-center text-sm text-red-400">{serverError}</p>
          )}

          <div className="pt-2">
            <Button type="submit" variant="secondary" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>


        <p className="mt-6 text-center text-sm text-slate-300">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="font-semibold text-white underline-offset-2 hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
