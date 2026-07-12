"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing. Please check your verification link.");
      return;
    }

    const performVerification = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus("success");
          setMessage("Your email has been successfully verified! You can now log in.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The link may have expired or already been used.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("A connection error occurred. Please try again.");
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Brand Header */}
      <div className="space-y-2 text-center">
        <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
          StatusForge
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email Account Verification</p>
      </div>

      <div className="space-y-4">
        {status === "loading" && (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30">
              ✓
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{message}</p>
            <Link
              href="/login?verified=true"
              className="block w-full text-center rounded bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 shadow-sm transition-colors cursor-pointer"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-150 dark:border-red-900/30">
              ✕
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{message}</p>
            <Link
              href="/login"
              className="block w-full text-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm transition-colors cursor-pointer"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] dark:bg-gray-900 p-4 transition-colors duration-150 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Suspense fallback={
        <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm flex items-center justify-center min-h-[250px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
