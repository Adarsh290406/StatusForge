import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9fafb] dark:bg-gray-900 p-4 transition-colors duration-150 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
