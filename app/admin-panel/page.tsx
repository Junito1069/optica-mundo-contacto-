"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, loading, isCustomer } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?returnUrl=%2Fadmin-panel");
      return;
    }

    if (!loading && isCustomer) {
      router.replace("/dashboard-usuario");
    }
  }, [loading, user, isCustomer, router]);

  if (loading || !user) {
    return <main className="account-page"><p>Cargando panel administrativo...</p></main>;
  }

  return (
    <main className="account-page">
      <p>PANEL ADMINISTRATIVO</p>
      <h1>Hola, {user.name}</h1>
      <div className="account-summary">
        <span>{user.email}</span>
        <span>Administración de catálogo, pedidos e inventario.</span>
      </div>
    </main>
  );
}
