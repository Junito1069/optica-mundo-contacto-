"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isAdminRole, isCustomerRole, type PublicUser } from "@/types/user";
import { apiUrl } from "@/lib/api-url";
type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  isCustomer: boolean;
  isAdmin: boolean;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, { cache: "no-store", credentials: "include" });
      const payload = await response.json() as { user: PublicUser | null };
      setUser(payload.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch(`${apiUrl}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  const isCustomer = Boolean(user && (isCustomerRole(user.role) || !isAdminRole(user.role)));
  const isAdmin = Boolean(user && isAdminRole(user.role));

  const value = useMemo(() => ({ user, loading, refresh, logout, isCustomer, isAdmin }), [user, loading, refresh, logout, isCustomer, isAdmin]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}