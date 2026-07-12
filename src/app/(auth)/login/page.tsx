"use client";

import { useActionState, Suspense, useEffect } from "react";
import { login } from "@/actions/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

function LoginForm() {
  const [state, action, isPending] = useActionState(login, null);
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified");
  const verifyError = searchParams.get("verifyError");
  const registered = searchParams.get("registered");

  useEffect(() => {
    if (verified === "true") {
      toast.success("Email verified successfully! You can now log in.");
    }
    if (verifyError) {
      toast.error("Email verification failed. The link may be invalid or expired.");
    }
    if (registered === "true") {
      toast.info("Account registered! Please verify your email before logging in.");
    }
  }, [verified, verifyError, registered]);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <div className="space-y-2 text-center pt-2">
        <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
          StatusForge
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Enter your credentials to manage status</p>
      </div>

      <form action={action} className="space-y-4">
        {/* Verification Success Alert */}
        {verified === "true" && (
          <div className="rounded-md bg-green-50 dark:bg-green-950/20 p-3 text-xs text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30">
            Email verified successfully! You can now log in.
          </div>
        )}

        {/* Verification Error Alert */}
        {verifyError && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 text-xs text-red-600 dark:text-red-400 border border-red-150 dark:border-red-900/30">
            {verifyError === "invalid_or_expired"
              ? "The verification link was invalid or has expired."
              : "Email verification failed. Please try again."}
          </div>
        )}

        {/* Registered Success Info Alert */}
        {registered === "true" && (
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 text-xs text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">
            Account created! Please check your server console/logs for the email verification link to verify your account.
          </div>
        )}

        {/* General Form Error Alert */}
        {state?.error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 text-xs text-red-600 dark:text-red-400 border border-red-150 dark:border-red-900/30">
            {state.error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:bg-gray-300 dark:disabled:bg-gray-800 shadow-sm transition-colors cursor-pointer"
        >
          {isPending ? "Logging in..." : "Log in"}
        </button>
      </form>

      {/* Back navigation & Signup redirections */}
      <div className="space-y-4 pt-2 text-center text-xs">
        <div>
          <Link href="/forgot-password" className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1">
            Forgot password?
          </Link>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Don't have an account? </span>
          <Link href="/signup" className="font-bold hover:underline text-blue-600 dark:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-0.5">
            Sign up
          </Link>
        </div>
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <Link href="/" className="text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-600 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[250px] flex items-center justify-center text-gray-400 font-semibold animate-pulse">
        Loading...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
