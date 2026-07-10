"use client";

import { useEffect, useState } from "react";

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

export function useSSE() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("snapshot", (e) => {
      try {
        const data = JSON.parse(e.data);
        setServices(data.services || []);
        setIncidents(data.incidents || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to parse initial snapshot.");
        setLoading(false);
      }
    });

    eventSource.addEventListener("service-update", (e) => {
      try {
        const data = JSON.parse(e.data); // { id, name, description, status }
        setServices((prev) => {
          const exists = prev.some((s) => s.id === data.id);
          if (exists) {
            return prev.map((s) => (s.id === data.id ? { ...s, ...data } : s));
          }
          return [...prev, data];
        });
      } catch (err) {
        console.error("Failed to parse service-update:", err);
      }
    });

    eventSource.addEventListener("service-delete", (e) => {
      try {
        const data = JSON.parse(e.data); // { id }
        setServices((prev) => prev.filter((s) => s.id !== data.id));
      } catch (err) {
        console.error("Failed to parse service-delete:", err);
      }
    });

    eventSource.addEventListener("incident-created", (e) => {
      try {
        const data = JSON.parse(e.data); // { id, title, severity, status, createdAt, updates, serviceIds }
        setIncidents((prev) => [data, ...prev]);
      } catch (err) {
        console.error("Failed to parse incident-created:", err);
      }
    });

    eventSource.addEventListener("incident-update", (e) => {
      try {
        const data = JSON.parse(e.data); // { id, update }
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === data.id
              ? {
                  ...i,
                  status: data.update.statusAtTime,
                  updates: [...i.updates, data.update],
                }
              : i
          )
        );
      } catch (err) {
        console.error("Failed to parse incident-update:", err);
      }
    });

    eventSource.addEventListener("incident-resolved", (e) => {
      try {
        const data = JSON.parse(e.data); // { id, update, resolvedServiceIds }
        // 1. Remove resolved incident from active/ongoing list
        setIncidents((prev) => prev.filter((i) => i.id !== data.id));
        // 2. Set all resolved services back to operational status reactively
        setServices((prev) =>
          prev.map((s) =>
            data.resolvedServiceIds.includes(s.id)
              ? { ...s, status: "operational" as const }
              : s
          )
        );
      } catch (err) {
        console.error("Failed to parse incident-resolved:", err);
      }
    });

    eventSource.onerror = () => {
      setError("Disconnected from live updates stream. Reconnecting...");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { services, incidents, loading, error };
}
