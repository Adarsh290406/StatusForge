"use client";

import { useEffect, useState } from "react";
import { logout } from "@/actions/auth";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

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
      toast.success(editId ? "Service updated successfully." : "Service created successfully.");
      setShowModal(false);
      setName("");
      setDescription("");
      setEditId(null);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Failed to save service.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    const originalService = services.find((s) => s.id === id);
    if (!originalService) return;
    const oldStatus = originalService.status;

    // Optimistically update UI
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Service "${originalService.name}" is now ${newStatus}.`);
      fetchServices();
    } catch (err: any) {
      // Revert UI on failure
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: oldStatus } : s))
      );
      toast.error(err.message || "Failed to update service status.");
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
      toast.success("Service deleted successfully.");
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete service.");
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
      if (!res.ok) throw new Error("Failed to save order");
      toast.success("Service order re-arranged.");
    } catch (err: any) {
      toast.error("Failed to reorder services.");
      fetchServices();
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "operational") return "bg-green-500";
    if (status === "degraded") return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "operational") return "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50";
    if (status === "degraded") return "text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50";
    return "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50";
  };

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

        {/* Section title & CTA header */}
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure and manage individual components</p>
          </div>
          <button
            onClick={() => {
              setEditId(null);
              setName("");
              setDescription("");
              setShowModal(true);
            }}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Add Service
          </button>
        </div>

        {/* Loading skeleton wrapper */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-32 w-full animate-pulse rounded-xl bg-gray-200/60 dark:bg-gray-800/60" />
            <div className="h-32 w-full animate-pulse rounded-xl bg-gray-200/60 dark:bg-gray-800/60" />
          </div>
        )}

        {/* Error wrapper */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-900/40 text-center space-y-3">
            <p className="text-sm text-red-700 dark:text-red-450 font-medium">{error}</p>
            <button
              onClick={fetchServices}
              className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state component */}
        {!loading && !error && services.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
            <span className="text-4xl select-none">🖥️</span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">No services yet</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create your first service component to start tracking health.</p>
            </div>
            <button
              onClick={() => {
                setEditId(null);
                setName("");
                setDescription("");
                setShowModal(true);
              }}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Add Service
            </button>
          </div>
        )}

        {/* Card-based Services Grid */}
        {!loading && !error && services.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm flex flex-col justify-between space-y-6"
              >
                {/* Header details */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                      {service.name}
                    </h3>

                    {/* Sorting handles */}
                    <div className="flex gap-1 border border-gray-200 dark:border-gray-800 rounded p-1 bg-gray-50 dark:bg-gray-900 shrink-0">
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 px-1 text-xs"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={index === services.length - 1}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 px-1 text-xs"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                      {service.description}
                    </p>
                  )}
                </div>

                {/* Footer Controls & Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4">
                  {/* Status and Toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(service.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(service.status)}`} />
                      <span className="capitalize">{service.status}</span>
                    </div>

                    <select
                      value={service.status}
                      onChange={(e) => handleStatusChange(service.id, e.target.value)}
                      className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-2 py-1 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <option value="operational">Operational</option>
                      <option value="degraded">Degraded</option>
                      <option value="down">Down</option>
                    </select>
                  </div>

                  {/* Actions buttons list */}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditId(service.id);
                        setName(service.name);
                        setDescription(service.description || "");
                        setShowModal(true);
                      }}
                      className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="rounded border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Modal Overlay Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl space-y-4 border border-gray-200 dark:border-gray-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {editId ? "Edit Service details" : "Add New Service component"}
            </h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="modal-name">
                  Service Name
                </label>
                <input
                  id="modal-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="e.g. Website API"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300" htmlFor="modal-desc">
                  Description (optional)
                </label>
                <textarea
                  id="modal-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="e.g. Serves critical rest endpoints"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
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
