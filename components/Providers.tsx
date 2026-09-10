"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/components/Cart/CartProvider";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider><CartProvider><PerformanceMetrics />{children}</CartProvider></AuthProvider>;
}