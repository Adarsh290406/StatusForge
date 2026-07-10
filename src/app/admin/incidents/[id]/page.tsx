"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  updates: Update[];
  serviceIds: string[];
};

type Service = {
  id: string;
  name: string;
};

export default function IncidentDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [incident, setIncident] = useState<Incident | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Update Form Fields
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

      setIncident(await incidentRes.json());
      setServices(await servicesRes.json());
    } catch (err) {
      setError("Failed to fetch incident details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      if (!res.ok) throw new Error();
      setMessage("");
      fetchData();
    } catch (err) {
      alert("Failed to post update.");
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
      if (!res.ok) throw new Error();
      setShowResolveModal(false);
      setMessage("");
      fetchData();
    } catch (err) {
      alert("Failed to resolve incident.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6 flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Loading incident details...</div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6 flex flex-col items-center justify-center space-y-4">
        <div className="text-red-600 font-medium">{error || "Incident not found."}</div>
        <Link href="/admin/incidents" className="text-zinc-900 font-semibold hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  const affectedServiceNames = services
    .filter((s) => incident.serviceIds.includes(s.id))
    .map((s) => s.name)
    .join(", ");

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Nav Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <Link href="/admin/incidents" className="text-sm font-semibold text-zinc-900 hover:underline">
            ← Back to Incidents
          </Link>
          {incident.status !== "resolved" && (
            <button
              onClick={() => {
                setMessage("");
                setShowResolveModal(true);
              }}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Resolve Incident
            </button>
          )}
        </div>

        {/* Overview Details */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-zinc-900">{incident.title}</h1>
            <p className="text-sm text-zinc-500">
              Severity: <span className="capitalize font-semibold text-zinc-700">{incident.severity}</span> | Status:{" "}
              <span className="capitalize font-semibold text-zinc-700">{incident.status}</span>
            </p>
          </div>

          <div className="text-sm text-zinc-600 border-t border-zinc-100 pt-4">
            <span className="font-semibold text-zinc-900">Affected Services: </span>
            {affectedServiceNames || "None"}
          </div>
        </div>

        {/* Timeline Updates */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900">Timeline</h3>
          {incident.updates.length === 0 ? (
            <p className="text-sm text-zinc-500">No updates posted yet.</p>
          ) : (
            <div className="relative border-l border-zinc-200 pl-6 ml-2 space-y-6">
              {[...incident.updates].reverse().map((update) => (
                <div key={update.id} className="relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-8 top-1.5 h-3 w-3 rounded-full border border-zinc-300 bg-white" />
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-800 font-medium">{update.message}</p>
                    <div className="flex gap-2 text-xs text-zinc-400">
                      <span>{new Date(update.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span className="capitalize font-medium text-zinc-500">{update.statusAtTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Update Form */}
        {incident.status !== "resolved" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900">Post New Update</h3>
            <form onSubmit={handlePostUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="update-msg">
                  Message
                </label>
                <textarea
                  id="update-msg"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  placeholder="e.g. We have identified a routing loop and are deploying a hotfix."
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="update-status">
                  Update Status To
                </label>
                <select
                  id="update-status"
                  value={statusAtTime}
                  onChange={(e) => setStatusAtTime(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                >
                  <option value="investigating">Investigating</option>
                  <option value="identified">Identified</option>
                  <option value="monitoring">Monitoring</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Post Update
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Resolve Incident Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-zinc-900">Resolve Incident</h2>
            <p className="text-sm text-zinc-500">
              Provide a final closing message. All linked services will automatically return to Operational.
            </p>
            <form onSubmit={handleResolve} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="resolve-msg">
                  Closing Message
                </label>
                <textarea
                  id="resolve-msg"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  placeholder="e.g. The root cause has been patched and services have fully stabilized."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
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
