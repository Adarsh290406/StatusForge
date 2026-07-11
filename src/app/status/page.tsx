"use client";

import { useSSE } from "@/hooks/use-sse";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PublicStatusPage() {
  const { services, incidents, loading, error } = useSSE();

  const getSystemStatus = () => {
    if (services.length === 0) {
      return {
        label: "System Status Unknown",
        description: "No services are currently monitored by StatusForge.",
        color: "bg-gray-400",
        bgClass: "bg-gray-500 dark:bg-gray-700 text-white",
        icon: "⚪",
      };
    }

    const hasDown = services.some((s) => s.status === "down");
    if (hasDown) {
      return {
        label: "Major Outage",
        description: "Some systems are experiencing critical outages.",
        color: "bg-red-500",
        bgClass: "bg-red-500 dark:bg-red-600 text-white",
        icon: "🚨",
      };
    }

    const hasDegraded = services.some((s) => s.status === "degraded");
    if (hasDegraded) {
      return {
        label: "Some Systems Degraded",
        description: "We are currently experiencing degraded performance on some systems.",
        color: "bg-yellow-500",
        bgClass: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-900 dark:text-yellow-250 border border-yellow-200 dark:border-yellow-900/50",
        icon: "⚠️",
      };
    }

    return {
      label: "All Systems Operational",
      description: "Everything is running smoothly.",
      color: "bg-green-500",
      bgClass: "bg-green-500 dark:bg-green-600 text-white",
      icon: "✅",
    };
  };

  const getServiceStatusHelper = (status: string) => {
    if (status === "operational") {
      return { label: "Operational", color: "bg-green-500", icon: "✓", text: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50" };
    }
    if (status === "degraded") {
      return { label: "Degraded", color: "bg-yellow-500", icon: "!", text: "text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50" };
    }
    return { label: "Down", color: "bg-red-500", icon: "✕", text: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50" };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center transition-colors duration-150">
      {/* Floating Reconnecting Banner */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-yellow-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md animate-bounce" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[1280px] px-6 py-8 space-y-8 flex-1 flex flex-col">
        {/* Navigation bar */}
        <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            StatusForge
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/status/history"
              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
            >
              History
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
            >
              Sign In
            </Link>
            <div className="pl-1 border-l border-gray-200 dark:border-gray-800">
              <ThemeToggle />
            </div>
          </nav>
        </header>

        {/* Large Colored System Status Banner */}
        {!loading && (
          <div
            className={`w-full rounded-xl py-6 px-8 shadow-sm flex items-center justify-between transition-colors ${systemStatus.bgClass}`}
            role="status"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{systemStatus.label}</h2>
              <p className="text-sm opacity-90">{systemStatus.description}</p>
            </div>
            <span className="text-4xl select-none hidden sm:inline">{systemStatus.icon}</span>
          </div>
        )}

        {/* Loading States */}
        {loading && (
          <div className="space-y-6">
            <div className="h-24 w-full animate-pulse rounded-xl bg-gray-200/60 dark:bg-gray-800/60" />
            <div className="h-60 w-full animate-pulse rounded-xl bg-gray-200/60 dark:bg-gray-800/60" />
          </div>
        )}

        {!loading && (
          <div className="grid gap-8 lg:grid-cols-3 items-start flex-1">
            {/* Left/Middle Column: Services List (Spans 2 columns on lg) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4">
                <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Services</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current status of monitored components</p>
                </div>

                {services.length === 0 ? (
                  <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                    No services configured yet.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {services.map((service) => {
                      const statusDetails = getServiceStatusHelper(service.status);
                      return (
                        <div key={service.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{service.name}</h4>
                            {service.description && (
                              <p className="text-xs text-gray-400 dark:text-gray-400 font-medium">{service.description}</p>
                            )}
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${statusDetails.text}`}>
                            <span className={`h-2 w-2 rounded-full status-dot-transition ${statusDetails.color}`} />
                            {statusDetails.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Ongoing Incidents */}
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4">
                <div className="pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ongoing Incidents</h3>
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                </div>

                {incidents.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                    👍 All systems are operational. No ongoing incidents reported.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {incidents.map((incident) => (
                      <div key={incident.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 space-y-4">
                        <div className="flex items-start justify-between border-b border-gray-200/65 dark:border-gray-800 pb-2">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{incident.title}</h4>
                            <span className="inline-flex rounded-full bg-red-100 dark:bg-red-950/40 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider border border-red-200 dark:border-red-900/30">
                              {incident.severity}
                            </span>
                          </div>
                          <span className="rounded-full bg-white dark:bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 capitalize">
                            {incident.status}
                          </span>
                        </div>

                        {/* Timeline of updates */}
                        <div className="relative border-l border-gray-200 dark:border-gray-800 pl-4 ml-1.5 space-y-4">
                          {[...incident.updates].reverse().map((update) => (
                            <div key={update.id} className="relative space-y-1">
                              <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm" />
                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{update.message}</p>
                              <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                                {new Date(update.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
          Powered by{" "}
          <Link href="/" className="font-semibold text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline">
            StatusForge
          </Link>
        </footer>
      </div>
    </div>
  );
}
