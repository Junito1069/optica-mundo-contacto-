"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/components/Cart/CartProvider";
import { AuthProvider } from "@/components/Auth/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider><CartProvider>{children}</CartProvider></AuthProvider>;
}