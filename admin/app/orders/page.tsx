"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002").replace(/\/$/, "");

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number | string;
  total: number | string;
};

type OrderRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  total: number | string;
  items: OrderItem[];
};

export default function OrdersPage() {
  return <AdminShell>{() => <OrdersList />}</AdminShell>;
}

function OrdersList() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetch(`${apiUrl}/api/admin/orders`, { credentials: "include" })
      .then(async (response) => {
        const payload = await response.json() as { data?: OrderRow[] };
        return payload.data ?? [];
      })
      .then((data) => { setOrders(data); })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="admin-content"><p>Cargando pedidos...</p></main>;
  if (!orders.length) return <main className="admin-content"><p>No hay pedidos.</p></main>;

  return <main className="admin-content"><h1>Pedidos</h1><div className="orders-list">{orders.map((o) => <article key={o.id} className="order-card"><h2>{o.orderNumber}</h2><p>{new Date(o.createdAt).toLocaleString()}</p><p>Cliente: {o.customerName} — {o.customerPhone}</p><p>Total: RD$ {Number(o.total).toFixed(2)}</p><details><summary>Ver productos</summary><ul>{o.items.map((it) => <li key={it.id}>{it.name} — {it.quantity} × RD$ {Number(it.unitPrice).toFixed(2)} = RD$ {Number(it.total).toFixed(2)}</li>)}</ul></details></article>)}</div></main>;
}
