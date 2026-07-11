"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "@/actions/auth";

type Incident = {
  id: string;
  title: string;
  severity: "minor" | "major" | "critical";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  createdAt: string;
  serviceIds: string[];
};

type Service = {
  id: string;
  name: string;
};

export default function IncidentsDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<"open" | "resolved">("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<"minor" | "major" | "critical">("minor");
  const [status, setStatus] = useState<"investigating" | "identified" | "monitoring">("investigating");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const servicesRes = await fetch("/api/services");
      const incidentsRes = await fetch(`/api/incidents?status=${activeTab}`);
      if (!servicesRes.ok || !incidentsRes.ok) throw new Error();

      setServices(await servicesRes.json());
      setIncidents(await incidentsRes.json());
    } catch (err) {
      setError("Failed to fetch data. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || selectedServiceIds.length === 0) return;

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          severity,
          status,
          serviceIds: selectedServiceIds,
        }),
      });

      if (!res.ok) throw new Error();
      setShowModal(false);
      setTitle("");
      setSelectedServiceIds([]);
      fetchData();
    } catch (err) {
      alert("Failed to create incident.");
    }
  };

  const handleServiceToggle = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === "critical") return "bg-red-50 text-red-700 border-red-200";
    if (sev === "major") return "bg-yellow-50 text-yellow-700 border-yellow-250";
    return "bg-gray-100 text-gray-700 border-gray-250";
  };

  const getAffectedServiceNames = (serviceIds: string[]) => {
    return services
      .filter((s) => serviceIds.includes(s.id))
      .map((s) => s.name)
      .join(", ");
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 flex flex-col items-center">
      {/* Container wrapper */}
      <div className="w-full max-w-[1280px] px-6 py-8 space-y-8 flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex items-center justify-between pb-4 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            StatusForge
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
            >
              Services
            </Link>
            <Link
              href="/status"
              target="_blank"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
            >
              View Public Status ↗
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded cursor-pointer"
              >
                Logout
              </button>
            </form>
          </nav>
        </header>

        {/* Breadcrumb section */}
        <div className="text-xs font-semibold text-gray-400 space-x-1.5">
          <Link href="/admin" className="hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
            Dashboard
          </Link>
          <span>&gt;</span>
          <span className="text-gray-600">Incidents</span>
        </div>

        {/* Section title & CTA header */}
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Incidents</h2>
            <p className="text-xs text-gray-500">Log and manage timeline updates during outages</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Report Incident
          </button>
        </div>

        {/* Tabs styled as pill switcher */}
        <div className="flex gap-2 p-1 bg-gray-250/60 rounded-lg max-w-xs border border-gray-200">
          <button
            onClick={() => setActiveTab("open")}
            className={`flex-1 text-center py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
              activeTab === "open"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`flex-1 text-center py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
              activeTab === "resolved"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Resolved
          </button>
        </div>

        {/* Loading skeleton wrapper */}
        {loading && (
          <div className="space-y-4">
            <div className="h-24 w-full animate-pulse rounded-xl bg-gray-200/60" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-gray-200/60" />
          </div>
        )}

        {/* Error wrapper */}
        {error && (
          <div className="rounded-xl bg-red-50 p-6 border border-red-200 text-center space-y-3">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchData}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state component */}
        {!loading && !error && incidents.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
            <span className="text-4xl select-none">🚨</span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">
                {activeTab === "open" ? "No open incidents" : "No resolved incidents history"}
              </h3>
              <p className="text-xs text-gray-500">
                {activeTab === "open" ? "Everything is running smoothly." : "Resolved logs appear here."}
              </p>
            </div>
            {activeTab === "open" && (
              <button
                onClick={() => setShowModal(true)}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Report Incident
              </button>
            )}
          </div>
        )}

        {/* Incidents Card List */}
        {!loading && !error && incidents.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/admin/incidents/${incident.id}`}
                      className="text-base font-bold text-gray-900 hover:text-blue-600 hover:underline leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-0.5"
                    >
                      {incident.title}
                    </Link>
                    <span
                      className={`shrink-0 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase border ${getSeverityBadge(
                        incident.severity
                      )}`}
                    >
                      {incident.severity}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    <span className="font-semibold text-gray-700">Services:</span>{" "}
                    {getAffectedServiceNames(incident.serviceIds) || "None"}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-400">
                  <span>Logged {new Date(incident.createdAt).toLocaleDateString()}</span>
                  <span className="capitalize text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {incident.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Incident Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4 border border-gray-200">
            <h2 className="text-base font-bold text-gray-900">Report New Incident</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700" htmlFor="inc-title">
                  Incident Title
                </label>
                <input
                  id="inc-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900"
                  placeholder="e.g. Server response latency spike"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700" htmlFor="inc-severity">
                    Severity
                  </label>
                  <select
                    id="inc-severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900"
                  >
                    <option value="minor">Minor</option>
                    <option value="major">Major</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700" htmlFor="inc-status">
                    Initial Status
                  </label>
                  <select
                    id="inc-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900"
                  >
                    <option value="investigating">Investigating</option>
                    <option value="identified">Identified</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Affects Services</label>
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1 bg-gray-50/50">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="rounded border-gray-200 text-blue-600 focus:ring-blue-600 focus-visible:ring-offset-2"
                      />
                      {service.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedServiceIds.length === 0}
                  className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 shadow-sm"
                >
                  Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
