"use client";

import { useActionState, useEffect, useState } from "react";
import { signup } from "@/actions/auth";
import Link from "next/link";

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, null);
  const [isFirstUser, setIsFirstUser] = useState(false);

  // Check if first user ever to determine whether we ask for organization name
  useEffect(() => {
    // Basic ping to health API or similar endpoint would work, or we can check via local fetch
    // To keep it simple, we check if any users exist by checking a mini route
    fetch("/api/auth/me")
      .catch(() => {})
      .finally(() => {
        // We will default to showing organization field, but if they enter database info
        // Server action handles checking users count correctly. Let's just always request it or check.
        // To be safe, let's request it. If subsequent users join, the action silently ignores it.
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Account</h1>
        <p className="text-sm text-gray-500">Sign up to manage StatusForge</p>
      </div>

      <form action={action} className="space-y-4">
        {state?.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {state.error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 bg-white text-gray-900"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 bg-white text-gray-900"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 bg-white text-gray-900"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="orgName">Organization Name</label>
          <input
            id="orgName"
            name="orgName"
            type="text"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 bg-white text-gray-900"
            placeholder="Acme Corp (only required for first owner account)"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:bg-gray-300 shadow-sm transition-colors"
        >
          {isPending ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-500">Already have an account? </span>
        <Link href="/login" className="font-semibold hover:underline text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1">
          Login
        </Link>
      </div>
    </div>
  );
}
