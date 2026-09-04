"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/Auth/AuthProvider";
import { apiUrl } from "@/lib/api-url";

type OrderItem = { id: string; name: string; quantity: number; unitPrice: number; total: number };
type Order = { orderNumber: string; status: string; total: number; items: OrderItem[] };

export default function OrderDetailClient() {
  const { user } = useAuth();
  const [id] = useState<string | null>(() => typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("id"));
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    void fetch(`${apiUrl}/api/orders/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((payload: { data?: Order | null }) => setOrder(payload.data ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return <main className="account-page"><Link className="brand" href="/">MUNDO <span>CONTACTO</span></Link><p>Cargando pedido...</p></main>;
  if (!order) return <main className="account-page"><Link className="brand" href="/">MUNDO <span>CONTACTO</span></Link><p>No se encontró el pedido.</p></main>;

  return <main className="account-page"><Link className="brand" href="/">MUNDO <span>CONTACTO</span></Link><h1>Pedido {order.orderNumber}</h1><p>Estado: {order.status}</p><p>Total: RD$ {Number(order.total).toFixed(2)}</p><h2>Productos</h2><ul>{order.items.map((item) => <li key={item.id}>{item.name} — {item.quantity} × RD$ {Number(item.unitPrice).toFixed(2)} = RD$ {Number(item.total).toFixed(2)}</li>)}</ul><Link className="secondary-action" href="/">IR A LA TIENDA</Link></main>;
}