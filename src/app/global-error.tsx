"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled global boundary error:", error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-screen items-center justify-center bg-[#f9fafb] dark:bg-gray-900 p-4 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-150">
        <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm text-center space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
              Something went wrong
            </h2>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              System Error
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            An unexpected error occurred. Please try refreshing the page to recover.
          </p>

          {/* Actions */}
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 shadow-sm transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
