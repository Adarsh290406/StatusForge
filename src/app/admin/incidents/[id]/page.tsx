"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

type Update = {
  id: string;
  message: string;
  statusAtTime: string;
  createdAt: string;
};

type Service = {
  id: string;
  name: string;
};

type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  updates: Update[];
  serviceIds: string[];
};

export default function IncidentDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Update Form
  const [message, setMessage] = useState("");
  const [statusAtTime, setStatusAtTime] = useState("investigating");
  const [showResolveModal, setShowResolveModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const incidentRes = await fetch(`/api/incidents/${id}`);
      const servicesRes = await fetch("/api/services");
      if (!incidentRes.ok || !servicesRes.ok) throw new Error();

      const incData = await incidentRes.json();
      setIncident(incData);
      setServices(await servicesRes.json());
      
      // Sync the update form status statusAtTime to the incident's current status if not resolved
      if (incData.status !== "resolved") {
        setStatusAtTime(incData.status);
      }
    } catch (err) {
      setError("Failed to fetch incident details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowResolveModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [id]);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    try {
      const res = await fetch(`/api/incidents/${id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, statusAtTime }),
      });
      if (!res.ok) throw new Error("Failed to post update");
      toast.success("Incident update posted successfully.");
      setMessage("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to post update.");
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    try {
      const res = await fetch(`/api/incidents/${id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, statusAtTime: "resolved" }),
      });
      if (!res.ok) throw new Error("Failed to resolve incident");
      toast.success("Incident resolved successfully.");
      setShowResolveModal(false);
      setMessage("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve incident.");
    }
  };

  const getSeverityBadgeClass = (sev: string) => {
    if (sev === "critical") return "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50";
    if (sev === "major") return "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-250 dark:border-yellow-900/50";
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 p-6 flex items-center justify-center transition-colors duration-150">
        <div className="text-gray-400 dark:text-gray-500 animate-pulse font-semibold">Loading incident details...</div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 p-6 flex flex-col items-center justify-center space-y-4 transition-colors duration-150">
        <div className="text-red-600 dark:text-red-400 font-semibold">{error || "Incident not found."}</div>
        <Link
          href="/admin/incidents"
          className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Back to Incidents
        </Link>
      </div>
    );
  }

  const affectedServiceNames = services
    .filter((s) => incident.serviceIds.includes(s.id))
    .map((s) => s.name)
    .join(", ");

  const resolvedUpdate = incident.updates.find((u) => u.statusAtTime === "resolved");

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center transition-colors duration-150">
      {/* Container wrapper */}
      <div className="w-full max-w-[1280px] px-6 py-8 space-y-8 flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            StatusForge
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
            >
              Services
            </Link>
            <Link
              href="/admin/incidents"
              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
            >
              Incidents
            </Link>
            <Link
              href="/status"
              target="_blank"
              className="hidden sm:inline-flex text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
            >
              View Public Status ↗
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded cursor-pointer"
              >
                Logout
              </button>
            </form>
            <div className="pl-1 border-l border-gray-200 dark:border-gray-800">
              <ThemeToggle />
            </div>
          </nav>
        </header>

        {/* Breadcrumb path */}
        <div className="text-xs font-semibold text-gray-400 space-x-1.5">
          <Link href="/admin" className="hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
            Dashboard
          </Link>
          <span>&gt;</span>
          <Link href="/admin/incidents" className="hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
            Incidents
          </Link>
          <span>&gt;</span>
          <span className="text-gray-600 dark:text-gray-400 truncate max-w-[200px] inline-block align-bottom">
            {incident.title}
          </span>
        </div>

        {/* Top title card and main details */}
        <div className="grid gap-6 md:grid-cols-3 items-start">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{incident.title}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${getSeverityBadgeClass(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className="rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-2.5 py-0.5 text-[10px] font-bold text-gray-500 capitalize">
                      {incident.status}
                    </span>
                  </div>
                </div>

                {incident.status !== "resolved" && (
                  <button
                    onClick={() => {
                      setMessage("");
                      setShowResolveModal(true);
                    }}
                    className="rounded bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 transition-colors shadow-sm"
                  >
                    Resolve Incident
                  </button>
                )}
              </div>

              {resolvedUpdate && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-150 dark:border-green-900/40 text-green-800 dark:text-green-400 text-xs font-semibold leading-relaxed shadow-sm">
                  ✓ Resolved on {new Date(resolvedUpdate.createdAt).toLocaleString()}
                </div>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-900 dark:text-white">Affected Components:</span>{" "}
                {affectedServiceNames || "None"}
              </div>
            </div>

            {/* Timeline updates history list */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Timeline</h3>
              {incident.updates.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">No updates logged yet.</p>
              ) : (
                <div className="relative border-l border-gray-200 dark:border-gray-800 pl-6 ml-2 space-y-6">
                  {[...incident.updates].reverse().map((update) => (
                    <div key={update.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-8 top-1.5 h-3 w-3 rounded-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm" />
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{update.message}</p>
                        <div className="flex gap-2 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                          <span>{new Date(update.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span className="capitalize font-semibold text-gray-500 dark:text-gray-400">{update.statusAtTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Update status form cards */}
          {incident.status !== "resolved" && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800">
                Post New Update
              </h3>
              <form onSubmit={handlePostUpdate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="update-msg">
                    Message
                  </label>
                  <textarea
                    id="update-msg"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="e.g. Investigation is ongoing."
                    rows={3}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="update-status">
                    Update Status To
                  </label>
                  <select
                    id="update-status"
                    value={statusAtTime}
                    onChange={(e) => setStatusAtTime(e.target.value)}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="investigating">Investigating</option>
                    <option value="identified">Identified</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Post Update
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Resolve Incident Modal Overlay */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl space-y-4 border border-gray-200 dark:border-gray-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Resolve Incident</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Provide a closing report. Linked components will automatically return to Operational.
            </p>
            <form onSubmit={handleResolve} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="resolve-msg">
                  Closing Message
                </label>
                <textarea
                  id="resolve-msg"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="e.g. Patch deployed successfully."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 transition-colors shadow-sm"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
