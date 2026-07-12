"use client";

import { useActionState, useEffect } from "react";
import { signup } from "@/actions/auth";
import Link from "next/link";
import { toast } from "sonner";

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, null);

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
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Create your owner account to start tracking</p>
      </div>

      <form action={action} className="space-y-4">
        {state?.error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 text-xs text-red-650 dark:text-red-400 border border-red-155 dark:border-red-900/30">
            {state.error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
            placeholder="John Doe"
          />
        </div>

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

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="orgName">
            Organization Name
          </label>
          <input
            id="orgName"
            name="orgName"
            type="text"
            className="w-full rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
            placeholder="Acme Corp (only required for first owner)"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:bg-gray-300 dark:disabled:bg-gray-800 shadow-sm transition-colors cursor-pointer"
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      {/* Back navigation & Sign in redirections */}
      <div className="space-y-4 pt-2 text-center text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
          <Link href="/login" className="font-bold hover:underline text-blue-600 dark:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-0.5">
            Log in
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
