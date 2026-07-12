"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] dark:bg-gray-900 p-4 transition-colors duration-150 relative font-sans">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm text-center space-y-6">
        {/* Brand/Logo text */}
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            404
          </h2>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Page not found
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Go Home button */}
        <Link
          href="/"
          className="block w-full text-center rounded bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 shadow-sm transition-colors cursor-pointer"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
