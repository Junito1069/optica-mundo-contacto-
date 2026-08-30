"use client";

import { AdminShell } from "@/components/AdminShell";

export default function DashboardPage() {
  return <AdminShell>{(user) => <>
    <header className="admin-content-header"><div><p className="admin-kicker">PANEL OPERATIVO</p><h1>BUEN DÍA,<br /><em>{user.name}.</em></h1></div><p className="admin-role">{user.role}</p></header>
    <section className="admin-empty-state"><p>OPERACIÓN ACTIVA</p><h2>El catálogo ya está conectado a PostgreSQL.</h2><span>Gestiona productos, categorías e inventario desde las rutas del panel.</span></section>
  </>}</AdminShell>;
}