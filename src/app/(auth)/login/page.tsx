"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, null);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Login to StatusForge</h1>
        <p className="text-sm text-zinc-500">Enter your credentials to manage status</p>
      </div>

      <form action={action} className="space-y-4">
        {state?.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {state.error}
          </div>
        )}

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

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300"
        >
          {isPending ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-zinc-500">First time? </span>
        <Link href="/signup" className="font-medium hover:underline text-zinc-900">
          Create owner account
        </Link>
      </div>
    </div>
  );
}
