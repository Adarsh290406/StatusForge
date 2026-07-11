import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] dark:bg-gray-900 p-4 transition-colors duration-150">
      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
