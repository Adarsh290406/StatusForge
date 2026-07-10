"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    if (sev === "critical") return "bg-red-100 text-red-700 border-red-200";
    if (sev === "major") return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-zinc-100 text-zinc-700 border-zinc-200";
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Incidents Dashboard</h1>
            <p className="text-sm text-zinc-500">Track and publish incident reports</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              New Incident
            </button>
            <Link
              href="/admin"
              className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Services Dashboard
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("open")}
            className={`pb-2 text-sm font-semibold border-b-2 ${
              activeTab === "open"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            Open Incidents
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`pb-2 text-sm font-semibold border-b-2 ${
              activeTab === "resolved"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            Resolved Incidents
          </button>
        </div>

        {/* State handlers */}
        {loading && (
          <div className="space-y-4">
            <div className="h-16 w-full animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-16 w-full animate-pulse rounded-lg bg-zinc-200" />
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

        {!loading && !error && incidents.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center">
            <h3 className="text-sm font-semibold text-zinc-900">No incidents found</h3>
            <p className="mt-1 text-sm text-zinc-500">Everything is running smoothly!</p>
          </div>
        )}

        {/* Incidents List */}
        {!loading && !error && incidents.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <ul className="divide-y divide-zinc-200">
              {incidents.map((incident) => (
                <li key={incident.id} className="p-4 hover:bg-zinc-50 flex items-center justify-between">
                  <div className="space-y-1">
                    <Link
                      href={`/admin/incidents/${incident.id}`}
                      className="text-sm font-semibold text-zinc-900 hover:underline"
                    >
                      {incident.title}
                    </Link>
                    <div className="flex gap-2 text-xs text-zinc-500">
                      <span>Posted {new Date(incident.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{incident.status}</span>
                    </div>
                  </div>

                  <span
                    className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase ${getSeverityBadge(
                      incident.severity
                    )}`}
                  >
                    {incident.severity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Create Incident Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-zinc-900">Report New Incident</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="inc-title">
                  Incident Title
                </label>
                <input
                  id="inc-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  placeholder="e.g. Database connectivity issues"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="inc-severity">
                    Severity
                  </label>
                  <select
                    id="inc-severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  >
                    <option value="minor">Minor</option>
                    <option value="major">Major</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="inc-status">
                    Initial Status
                  </label>
                  <select
                    id="inc-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  >
                    <option value="investigating">Investigating</option>
                    <option value="identified">Identified</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Affects Services</label>
                <div className="max-h-36 overflow-y-auto border border-zinc-200 rounded-md p-2 space-y-1">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
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
                  className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedServiceIds.length === 0}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300"
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
