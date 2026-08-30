"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PublicUser } from "@/types/user";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002").replace(/\/$/, "");
type AuthContextValue = { user: PublicUser | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { try { const response = await fetch(`${apiUrl}/api/auth/me`, { cache: "no-store", credentials: "include" }); const payload = await response.json() as { user: PublicUser | null }; setUser(payload.user); } catch { setUser(null); } finally { setLoading(false); } }, []);
  useEffect(() => { const task = window.setTimeout(() => { void refresh(); }, 0); return () => window.clearTimeout(task); }, [refresh]);
  const logout = useCallback(async () => { await fetch(`${apiUrl}/api/auth/logout`, { method: "POST", credentials: "include" }); setUser(null); }, []);
  const value = useMemo(() => ({ user, loading, refresh, logout }), [user, loading, refresh, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within AuthProvider"); return context; }