"use client";

import { useSSE } from "@/hooks/use-sse";
import Link from "next/link";

export default function PublicStatusPage() {
  const { services, incidents, loading, error } = useSSE();

  const getSystemStatus = () => {
    if (services.length === 0) {
      return {
        label: "System Status Unknown",
        description: "No services are currently monitored by StatusForge.",
        color: "bg-zinc-500",
        bgClass: "bg-zinc-50 border-zinc-200 text-zinc-700",
        icon: "⚪",
      };
    }

    const hasDown = services.some((s) => s.status === "down");
    if (hasDown) {
      return {
        label: "Major Outage Detected",
        description: "Some services are down. Our engineering team is currently investigating the issue.",
        color: "bg-red-500",
        bgClass: "bg-red-50 border-red-200 text-red-700",
        icon: "🚨",
      };
    }

    const hasDegraded = services.some((s) => s.status === "degraded");
    if (hasDegraded) {
      return {
        label: "Degraded System Performance",
        description: "Some systems are experiencing high latency or degraded speeds.",
        color: "bg-yellow-500",
        bgClass: "bg-yellow-50 border-yellow-200 text-yellow-700",
        icon: "⚠️",
      };
    }

    return {
      label: "All Systems Operational",
      description: "Everything is running smoothly. No issues reported in the last 24 hours.",
      color: "bg-green-500",
      bgClass: "bg-green-50 border-green-200 text-green-700",
      icon: "✅",
    };
  };

  const getServiceStatusHelper = (status: string) => {
    if (status === "operational") {
      return { label: "Operational", color: "bg-green-500", icon: "✓", text: "text-green-700" };
    }
    if (status === "degraded") {
      return { label: "Degraded", color: "bg-yellow-500", icon: "!", text: "text-yellow-700" };
    }
    return { label: "Outage", color: "bg-red-500", icon: "✕", text: "text-red-700" };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="min-h-screen bg-[#f9fafb] p-6 flex flex-col items-center">
      {/* Floating Reconnecting Banner */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-yellow-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md animate-bounce" role="alert">
          ⚠️ {error}
        </div>
      )}

      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header & Logo */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            <span className="text-lg font-bold tracking-tight text-gray-900">StatusForge</span>
          </div>
          <Link href="/login" className="text-xs font-semibold text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded p-1" aria-label="Navigate to Admin Login">
            Admin Portal →
          </Link>
        </div>

        {/* Loading States */}
        {loading && (
          <div className="space-y-4">
            <div className="h-24 w-full animate-pulse rounded-xl bg-gray-200/60" />
            <div className="h-60 w-full animate-pulse rounded-xl bg-gray-200/60" />
          </div>
        )}

        {!loading && (
          <>
            {/* Visual System Status Card */}
            <div className={`rounded-xl border p-5 shadow-sm ${systemStatus.bgClass} flex gap-4 items-start`} role="status">
              <span className="text-3xl select-none">{systemStatus.icon}</span>
              <div className="space-y-1">
                <h2 className="text-base font-bold">{systemStatus.label}</h2>
                <p className="text-xs opacity-90 leading-relaxed">{systemStatus.description}</p>
              </div>
            </div>

            {/* Services Visual Grid */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">System Components</h3>
                <p className="text-xs text-gray-500">Real-time operational status of core components</p>
              </div>

              {services.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg">
                  No services configured. Register components in the admin portal.
                </div>
              ) : (
                <div className="grid gap-3">
                  {services.map((service) => {
                    const statusDetails = getServiceStatusHelper(service.status);
                    return (
                      <div key={service.id} className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50/30">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-gray-800">{service.name}</h4>
                          {service.description && (
                            <p className="text-xs text-gray-400 font-medium">{service.description}</p>
                          )}
                        </div>
                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-200 bg-white shadow-sm ${statusDetails.text}`}>
                          <span className={`h-2 w-2 rounded-full status-dot-transition ${statusDetails.color}`} />
                          {statusDetails.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ongoing Incidents Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Active Incidents</h3>
                  <p className="text-xs text-gray-500">Ongoing service issues and maintenance work</p>
                </div>
                <Link href="/status/history" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1">
                  Incident History →
                </Link>
              </div>

              {incidents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                  👍 All systems are currently green. No active incidents reported.
                </div>
              ) : (
                <div className="grid gap-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                      <div className="flex items-start justify-between border-b border-gray-150 pb-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-950">{incident.title}</h4>
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            Severity: {incident.severity}
                          </span>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600 border border-gray-200 capitalize">
                          {incident.status}
                        </span>
                      </div>

                      {/* Timeline with detailed visual spacing */}
                      <div className="relative border-l border-gray-200 pl-4 ml-1.5 space-y-4">
                        {[...incident.updates].reverse().map((update) => (
                          <div key={update.id} className="relative space-y-1">
                            <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-gray-300 bg-white" />
                            <p className="text-xs text-gray-700 leading-relaxed">{update.message}</p>
                            <span className="block text-[10px] text-gray-400 font-medium">
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
          </>
        )}
      </div>
    </div>
  );
}
