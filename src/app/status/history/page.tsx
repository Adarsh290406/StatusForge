"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Update = {
  id: string;
  message: string;
  createdAt: string;
};

type Incident = {
  id: string;
  title: string;
  createdAt: string;
  resolvedAt: string;
  updates: Update[];
};

export default function PublicIncidentHistory() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/public/incidents?history=true&page=${page}&q=${encodeURIComponent(search)}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIncidents(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError("Failed to load incident history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, search]);

  const getResolutionDuration = (start: string, end: string) => {
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const durationMin = Math.floor(durationMs / (60 * 1000));
    if (durationMin < 60) return `Resolved in ${durationMin}m`;
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;
    return `Resolved in ${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Nav Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <Link href="/status" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1">
            ← Back to Status Page
          </Link>
          <h1 className="text-sm font-bold text-gray-900">Incident History</h1>
        </div>

        {/* Search Input Bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset to first page on search
          }}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 bg-white text-gray-900"
          placeholder="Search past incidents by title..."
        />

        {/* Loading / Error States */}
        {loading && (
          <div className="space-y-4">
            <div className="h-20 w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-20 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-center space-y-2">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button onClick={fetchHistory} className="text-sm font-semibold text-red-800 hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* History List */}
        {!loading && !error && (
          <>
            {incidents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
                {search ? "No incidents match your search." : "No incident history recorded."}
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{incident.title}</h4>
                        <span className="text-[10px] text-gray-400">
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {getResolutionDuration(incident.createdAt, incident.resolvedAt)}
                      </span>
                    </div>

                    {/* Timeline summary of incident details */}
                    <div className="border-t border-gray-150 pt-3 space-y-2">
                      {incident.updates.map((update) => (
                        <div key={update.id} className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-700">
                            [{new Date(update.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                          </span>{" "}
                          {update.message}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {total > 20 && (
                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-750 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-500">
                      Page {page} of {Math.ceil(total / 20)}
                    </span>
                    <button
                      onClick={() => setPage((p) => (p * 20 < total ? p + 1 : p))}
                      disabled={page * 20 >= total}
                      className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-750 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
