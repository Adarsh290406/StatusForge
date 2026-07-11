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
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 flex flex-col items-center">
      <div className="w-full max-w-[1280px] px-6 py-8 space-y-8 flex-1 flex flex-col">
        {/* Nav Header */}
        <header className="flex items-center justify-between pb-4 border-b border-gray-200">
          <Link
            href="/status"
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
          >
            ← Back to current status
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Incident History</h1>
        </header>

        {/* Search Input Bar with magnifying glass icon representation */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 select-none">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset to first page on search
            }}
            className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 bg-white text-gray-900 shadow-sm"
            placeholder="Search past incidents by title..."
          />
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="space-y-4">
            <div className="h-20 w-full animate-pulse rounded-xl bg-gray-200" />
            <div className="h-20 w-full animate-pulse rounded-xl bg-gray-200" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-6 border border-red-200 text-center space-y-2">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchHistory}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* History List */}
        {!loading && !error && (
          <div className="flex-1 flex flex-col justify-between">
            {incidents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                <span className="text-4xl select-none">📁</span>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900">
                    {search ? "No incidents match your search." : "No incidents yet."}
                  </h3>
                  {search && (
                    <p className="text-xs text-gray-500">
                      Try adjusting keywords or clearing the search box.
                    </p>
                  )}
                </div>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 shadow-sm"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-base font-bold text-gray-900 leading-tight">
                            {incident.title}
                          </h4>
                          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 border border-green-200">
                            {getResolutionDuration(incident.createdAt, incident.resolvedAt)}
                          </span>
                        </div>
                        <span className="block text-[10px] text-gray-400 font-mono">
                          Resolved {new Date(incident.resolvedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Timeline summary of incident details */}
                      <div className="border-t border-gray-100 pt-3 space-y-2 mt-2">
                        {incident.updates.map((update) => (
                          <div key={update.id} className="text-xs text-gray-600 flex gap-2">
                            <span className="font-semibold text-gray-700 font-mono shrink-0">
                              [{new Date(update.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                            </span>
                            <span>{update.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {total > 20 && (
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="rounded border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-750 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-500 font-semibold">
                      Page {page} of {Math.ceil(total / 20)}
                    </span>
                    <button
                      onClick={() => setPage((p) => (p * 20 < total ? p + 1 : p))}
                      disabled={page * 20 >= total}
                      className="rounded border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-750 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
