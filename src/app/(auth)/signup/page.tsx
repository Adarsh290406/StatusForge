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
        <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
        <p className="text-sm text-zinc-500">Sign up to manage StatusForge</p>
      </div>

      <form action={action} className="space-y-4">
        {state?.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {state.error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="orgName">Organization Name</label>
          <input
            id="orgName"
            name="orgName"
            type="text"
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            placeholder="Acme Corp (only required for first owner account)"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300"
        >
          {isPending ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-zinc-500">Already have an account? </span>
        <Link href="/login" className="font-medium hover:underline text-zinc-900">
          Login
        </Link>
      </div>
    </div>
  );
}
