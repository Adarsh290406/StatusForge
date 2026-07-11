"use client";

import { useEffect, useState } from "react";
import { logout } from "@/actions/auth";
import Link from "next/link";

type Service = {
  id: string;
  name: string;
  description: string | null;
  status: "operational" | "degraded" | "down";
  sortOrder: number;
};

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      setError("Failed to load services. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const url = editId ? `/api/services/${editId}` : "/api/services";
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Operation failed");
      }
      setShowModal(false);
      setName("");
      setDescription("");
      setEditId(null);
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete");
      }
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= services.length) return;

    const reordered = [...services];
    const temp = reordered[index];
    reordered[index] = reordered[nextIndex];
    reordered[nextIndex] = temp;

    const updatedOrder = reordered.map((s, idx) => ({ id: s.id, sortOrder: idx + 1 }));

    setServices(
      reordered.map((s, idx) => ({ ...s, sortOrder: idx + 1 }))
    );

    try {
      const res = await fetch("/api/services/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: updatedOrder }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      fetchServices();
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "operational") return "bg-green-500";
    if (status === "degraded") return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col md:flex-row text-gray-900">
      {/* Dynamic Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 text-zinc-300 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">🛠️</span>
            <span className="font-bold tracking-tight text-base">StatusForge Admin</span>
          </div>

          <nav className="space-y-1 text-sm font-semibold">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              🖥️ Services Overview
            </Link>
            <Link
              href="/admin/incidents"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              🚨 Incidents Logs
            </Link>
            <Link
              href="/status"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              👁️ View Public Page
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-zinc-800">
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-zinc-800 hover:text-white transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              ↩ Logout Account
            </button>
          </form>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Services Overview</h1>
            <p className="text-xs text-gray-500">Monitor and configure individual system services</p>
          </div>
          <button
            onClick={() => {
              setEditId(null);
              setName("");
              setDescription("");
              setShowModal(true);
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            + Add Service
          </button>
        </div>

        {/* Informative Walkthrough Tips for New Users */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-150 flex gap-3 text-xs text-blue-700 leading-relaxed shadow-sm">
          <span className="text-lg">💡</span>
          <div>
            <p className="font-bold text-blue-800 mb-0.5">Quick Tips</p>
            <p>
              Services listed below represent core components. Use the dropdown status values to change status flags. Changes are pushed dynamically to the public status page using Server-Sent Events (SSE). Use the sorting arrows (▲/▼) to reorder priority.
            </p>
          </div>
        </div>

        {/* State handlers */}
        {loading && (
          <div className="space-y-3">
            <div className="h-16 w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-16 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-center space-y-2">
            <p className="text-xs text-red-700 font-medium">{error}</p>
            <button onClick={fetchServices} className="text-xs font-bold text-red-800 hover:underline">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
            <h3 className="text-sm font-bold text-gray-900">No services monitored yet</h3>
            <p className="mt-1 text-xs text-gray-500">Create your first service component to start tracking health.</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditId(null);
                  setName("");
                  setDescription("");
                  setShowModal(true);
                }}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                + Create Service
              </button>
            </div>
          </div>
        )}

        {/* Services List Table */}
        {!loading && !error && services.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-150">
              {services.map((service, index) => (
                <li key={service.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${getStatusColor(service.status)} shrink-0`} />
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-gray-900">{service.name}</h4>
                      {service.description && (
                        <p className="text-xs text-gray-500 font-medium">{service.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Status Dropdown */}
                    <select
                      value={service.status}
                      onChange={(e) => handleStatusChange(service.id, e.target.value)}
                      className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <option value="operational">Operational</option>
                      <option value="degraded">Degraded</option>
                      <option value="down">Outage / Down</option>
                    </select>

                    {/* Sorting handles */}
                    <div className="flex gap-1 border border-gray-200 rounded-md p-1 bg-gray-50">
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1 text-xs"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={index === services.length - 1}
                        className="text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1 text-xs"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1.5 ml-2">
                      <button
                        onClick={() => {
                          setEditId(service.id);
                          setName(service.name);
                          setDescription(service.description || "");
                          setShowModal(true);
                        }}
                        className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-250 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4 border border-gray-200">
            <h2 className="text-base font-bold text-gray-900">
              {editId ? "Edit Service details" : "Add New Service component"}
            </h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700" htmlFor="modal-name">
                  Service Name
                </label>
                <input
                  id="modal-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900"
                  placeholder="e.g. Website Front-End API"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700" htmlFor="modal-desc">
                  Description (optional)
                </label>
                <textarea
                  id="modal-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900"
                  placeholder="e.g. Handles marketing and landing requests"
                  rows={3}
                />
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
                  className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  {editId ? "Save Changes" : "Create Component"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
