"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to request password reset.");
      }

      const msg = "If your email is registered, we have sent a reset link to it. Please check your developer console/inbox.";
      setSuccess(msg);
      toast.success("Password reset request sent successfully.");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center pt-2">
        <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
          StatusForge
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Reset your account password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 text-xs text-red-600 dark:text-red-400 border border-red-150 dark:border-red-900/30">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-950/20 p-3 text-xs text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30">
            {success}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:bg-gray-300 dark:disabled:bg-gray-800 shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Sending Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs border-t border-gray-100 dark:border-gray-800">
        <Link href="/login" className="text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-600 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
