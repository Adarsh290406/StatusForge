"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Service = {
  id: string;
  name: string;
  description: string | null;
  status: "operational" | "degraded" | "down";
};

type Update = {
  id: string;
  message: string;
  statusAtTime: string;
  createdAt: string;
};

type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
  updates: Update[];
  serviceIds: string[];
};

export default function PublicStatusPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const servicesRes = await fetch("/api/public/services");
      const incidentsRes = await fetch("/api/public/incidents");
      if (!servicesRes.ok || !incidentsRes.ok) throw new Error();

      setServices(await servicesRes.json());
      const incidentData = await incidentsRes.json();
      setIncidents(incidentData.data || []);
    } catch (err) {
      setError("Unable to load systems status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSystemStatus = () => {
    if (services.length === 0) return { label: "No Services Monitored", color: "bg-zinc-500", text: "text-zinc-700" };
    
    const hasDown = services.some((s) => s.status === "down");
    if (hasDown) {
      return { label: "Major Outage", color: "bg-red-500", text: "text-red-700 bg-red-50" };
    }

    const hasDegraded = services.some((s) => s.status === "degraded");
    if (hasDegraded) {
      return { label: "Some Systems Degraded", color: "bg-yellow-500", text: "text-yellow-700 bg-yellow-50" };
    }

    return { label: "All Systems Operational", color: "bg-green-500", text: "text-green-700 bg-green-50" };
  };

  const getStatusColor = (status: string) => {
    if (status === "operational") return "bg-green-500";
    if (status === "degraded") return "bg-yellow-500";
    return "bg-red-500";
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="min-h-screen bg-zinc-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header & Logo */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">StatusForge</h1>
          <Link href="/login" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
            Admin Login
          </Link>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="space-y-4">
            <div className="h-16 w-full animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-44 w-full animate-pulse rounded-lg bg-zinc-200" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-center space-y-2">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button onClick={fetchData} className="text-sm font-semibold text-red-800 hover:underline">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* System Status Banner */}
            <div className={`flex items-center gap-3 rounded-lg border border-zinc-200/60 p-4 font-semibold text-sm ${systemStatus.text}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${systemStatus.color} animate-ping`} />
              {systemStatus.label}
            </div>

            {/* Services List Card */}
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Services</h3>
              {services.length === 0 ? (
                <p className="text-sm text-zinc-500">No services configured yet.</p>
              ) : (
                <ul className="divide-y divide-zinc-100 space-y-3">
                  {services.map((service) => (
                    <li key={service.id} className="flex items-center justify-between pt-3 first:pt-0">
                      <div>
                        <h4 className="text-sm font-medium text-zinc-800">{service.name}</h4>
                        {service.description && (
                          <p className="text-xs text-zinc-400">{service.description}</p>
                        )}
                      </div>
                      <span className="flex items-center gap-2 text-xs font-semibold text-zinc-500 capitalize">
                        <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(service.status)}`} />
                        {service.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Ongoing Incidents Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900">Ongoing Incidents</h3>
                <Link href="/status/history" className="text-xs font-semibold text-zinc-600 hover:underline">
                  Incident History →
                </Link>
              </div>

              {incidents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
                  No active incidents. Systems are stable.
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">{incident.title}</h4>
                        <span className="text-[10px] uppercase font-semibold text-zinc-400">
                          {incident.severity} Outage
                        </span>
                      </div>

                      {/* Updates Timeline inside incident container */}
                      <div className="relative border-l border-zinc-200 pl-4 ml-1 space-y-3">
                        {[...incident.updates].reverse().map((update) => (
                          <div key={update.id} className="relative">
                            <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-zinc-300 bg-white" />
                            <p className="text-xs text-zinc-700">{update.message}</p>
                            <span className="text-[10px] text-zinc-400">
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
