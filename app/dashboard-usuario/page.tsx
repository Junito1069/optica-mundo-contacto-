"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";

export default function DashboardUsuarioPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?returnUrl=%2Fdashboard-usuario");
      return;
    }

    if (!loading && isAdmin) {
      router.replace("/admin-panel");
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user) {
    return <main className="account-page"><p>Cargando tu panel...</p></main>;
  }

  return (
    <main className="account-page">
      <p>PANEL DE USUARIO</p>
      <h1>Bienvenido, {user.name}.</h1>
      <div className="account-summary">
        <span>{user.email}</span>
        <span>Tu historial y pedidos aparecerán aquí.</span>
      </div>
    </main>
  );
}
