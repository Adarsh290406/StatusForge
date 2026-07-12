"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!email) {
      setError("No email address provided. Please return to forgot password.");
    }
  }, [email]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !email) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed. Please retry.");
      }

      setSuccess("OTP verified! Redirecting to password reset...");
      setTimeout(() => {
        router.push("/reset-password");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
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
        throw new Error(data.error || "Failed to resend OTP.");
      }

      setSuccess("A new 6-digit OTP code has been sent!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center pt-2">
        <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
          StatusForge
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Enter the 6-digit code sent to <span className="font-semibold text-gray-700 dark:text-gray-300">{email || "your inbox"}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
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
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="otp">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center tracking-widest font-mono rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-lg focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
            placeholder="123456"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full rounded bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:bg-gray-300 dark:disabled:bg-gray-800 shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>
      </form>

      {/* Footer controls: resend OTP */}
      <div className="pt-2 text-center text-xs border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4">
        <Link href="/forgot-password" className="text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-600 dark:hover:text-gray-300">
          ← Start over
        </Link>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || !email}
          className="text-blue-600 dark:text-blue-400 font-bold hover:underline disabled:text-gray-300 dark:disabled:text-gray-700 focus-visible:outline-none"
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[250px] flex items-center justify-center text-gray-400 font-semibold animate-pulse">
        Loading...
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
