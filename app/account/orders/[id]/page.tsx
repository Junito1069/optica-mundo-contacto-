"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";

import { apiUrl } from "@/lib/api-url";

export default function OrderDetail() {
  const params = useParams();
  const { id } = params as { id: string };
  const { user } = useAuth();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void fetch(`${apiUrl}/api/orders/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((payload) => setOrder(payload.data ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return <main className="account-page"><Link className="brand" href="/">MUNDO <span>CONTACTO</span></Link><p>Cargando pedido...</p></main>;
  if (!order) return <main className="account-page"><Link className="brand" href="/">MUNDO <span>CONTACTO</span></Link><p>No se encontró el pedido.</p></main>;

  return <main className="account-page"><Link className="brand" href="/">MUNDO <span>CONTACTO</span></Link><h1>Pedido {order.orderNumber}</h1><p>Estado: {order.status}</p><p>Total: RD$ {Number(order.total).toFixed(2)}</p><h2>Productos</h2><ul>{order.items.map((it: any) => <li key={it.id}>{it.name} — {it.quantity} × RD$ {Number(it.unitPrice).toFixed(2)} = RD$ {Number(it.total).toFixed(2)}</li>)}</ul><Link className="secondary-action" href="/">IR A LA TIENDA</Link></main>;
}
