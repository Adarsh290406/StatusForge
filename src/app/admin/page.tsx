"use client";

import { useEffect, useState } from "react";
import { logout } from "@/actions/auth";

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

    // Recalculate sortOrder index sequentially
    const updatedOrder = reordered.map((s, idx) => ({ id: s.id, sortOrder: idx + 1 }));

    // Optimistic UI update
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
      fetchServices(); // rollback on failure
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "operational") return "bg-green-500";
    if (status === "degraded") return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Admin Dashboard</h1>
            <p className="text-sm text-zinc-500">Manage your system services and components</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditId(null);
                setName("");
                setDescription("");
                setShowModal(true);
              }}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Add Service
            </button>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* State handlers */}
        {loading && (
          <div className="space-y-4">
            <div className="h-16 w-full animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-16 w-full animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-16 w-full animate-pulse rounded-lg bg-zinc-200" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-center space-y-2">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchServices}
              className="text-sm font-semibold text-red-800 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center">
            <h3 className="text-sm font-semibold text-zinc-900">No services yet</h3>
            <p className="mt-1 text-sm text-zinc-500">Add your first service to start monitoring.</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditId(null);
                  setName("");
                  setDescription("");
                  setShowModal(true);
                }}
                className="inline-flex items-center rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Add Service
              </button>
            </div>
          </div>
        )}

        {/* Services List */}
        {!loading && !error && services.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <ul className="divide-y divide-zinc-200">
              {services.map((service, index) => (
                <li key={service.id} className="flex items-center justify-between p-4 hover:bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <span className={`h-3.5 w-3.5 rounded-full ${getStatusColor(service.status)}`} />
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">{service.name}</h4>
                      {service.description && (
                        <p className="text-xs text-zinc-500">{service.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status inline toggle */}
                    <select
                      value={service.status}
                      onChange={(e) => handleStatusChange(service.id, e.target.value)}
                      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 focus:outline-none"
                    >
                      <option value="operational">Operational</option>
                      <option value="degraded">Degraded</option>
                      <option value="down">Down</option>
                    </select>

                    {/* Sorting buttons */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={index === services.length - 1}
                        className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditId(service.id);
                          setName(service.name);
                          setDescription(service.description || "");
                          setShowModal(true);
                        }}
                        className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
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
      </div>

      {/* Create / Edit Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">
              {editId ? "Edit Service" : "Add New Service"}
            </h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700" htmlFor="modal-name">
                  Service Name
                </label>
                <input
                  id="modal-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  placeholder="e.g. Website API"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700" htmlFor="modal-desc">
                  Description (optional)
                </label>
                <textarea
                  id="modal-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  placeholder="e.g. Serves critical REST endpoints"
                  rows={3}
                />
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
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
