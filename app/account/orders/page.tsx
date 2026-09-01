"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/Auth/AuthProvider";

import { apiUrl } from "@/lib/api-url";

export default function AccountOrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) return; // user will be redirected elsewhere
    if (!user) return;
    void fetch(`${apiUrl}/api/orders/mine`, { credentials: "include" })
      .then((r) => r.json())
      .then((payload) => setOrders(payload.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [user, loading]);

  if (!user) return <main className="account-page"><p>Debes iniciar sesión para ver tus pedidos.</p></main>;
  if (loadingOrders) return <main className="account-page"><p>Cargando pedidos...</p></main>;

  return <main className="account-page"><h1>Mis pedidos</h1>{!orders.length ? <p>No tienes pedidos todavía.</p> : <ul className="orders-list">{orders.map((o) => <li key={o.id}><Link href={`/account/orders/${o.id}`}>{o.orderNumber} — RD$ {Number(o.total).toFixed(2)} — {o.status}</Link></li>)}</ul>}</main>;
}
