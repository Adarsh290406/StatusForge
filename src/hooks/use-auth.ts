"use client";

import { useEffect, useState } from "react";

export type AuthState = {
  authenticated: boolean;
  userId?: string;
  orgId?: string;
  role?: "owner" | "admin";
  loading: boolean;
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ authenticated: false, loading: true });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setAuth({ ...data, loading: false });
      })
      .catch(() => {
        setAuth({ authenticated: false, loading: false });
      });
  }, []);

  return auth;
}
