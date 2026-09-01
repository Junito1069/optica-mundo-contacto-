"use client";

import { AdminShell } from "@/components/AdminShell";
import { Activity, ArrowUpRight, Boxes, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiUrl } from "@/lib/api-url";

type OrderRow = { id: string; orderNumber: string; status: string; total: number | string; createdAt: string; customerName: string };
type ProductRow = { id: string; name: string; stock: number; minimumStock: number; status: string };

export default function DashboardPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    void Promise.all([
      fetch(`${apiUrl}/api/admin/orders`, { credentials: "include", cache: "no-store" }).then(async (response) => {
        if (!response.ok) return [] as OrderRow[];
        const payload = await response.json() as { data?: OrderRow[] };
        return payload.data ?? [];
      }),
      fetch(`${apiUrl}/api/admin/products`, { credentials: "include", cache: "no-store" }).then(async (response) => {
        if (!response.ok) return [] as ProductRow[];
        const payload = await response.json() as { data?: ProductRow[] };
        return payload.data ?? [];
      }),
    ]).then(([nextOrders, nextProducts]) => {
      setOrders(nextOrders);
      setProducts(nextProducts);
    }).catch(() => {
      setOrders([]);
      setProducts([]);
    });
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
    const totalOrders = orders.length;
    const lowStock = products.filter((product) => product.stock <= product.minimumStock).length;
    const publishedProducts = products.filter((product) => product.status === "PUBLISHED").length;
    const avgTicket = totalOrders ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      lowStock,
      publishedProducts,
      avgTicket,
    };
  }, [orders, products]);

  const latestOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  return <AdminShell>{(user) => <>
    <header className="admin-content-header"><div><p className="admin-kicker">PANEL OPERATIVO</p><h1>BUEN DÍA,<br /><em>{user.name}.</em></h1></div><p className="admin-role">{user.role}</p></header>

    <section className="admin-kpi-grid">
      <article className="admin-kpi-card">
        <div className="admin-kpi-icon green"><Wallet aria-hidden="true" size={18} /></div>
        <div>
          <span>Ingresos</span>
          <strong>RD$ {stats.totalRevenue.toLocaleString("es-DO", { maximumFractionDigits: 0 })}</strong>
        </div>
      </article>
      <article className="admin-kpi-card">
        <div className="admin-kpi-icon blue"><ShoppingCart aria-hidden="true" size={18} /></div>
        <div>
          <span>Pedidos</span>
          <strong>{stats.totalOrders}</strong>
        </div>
      </article>
      <article className="admin-kpi-card">
        <div className="admin-kpi-icon orange"><Boxes aria-hidden="true" size={18} /></div>
        <div>
          <span>Stock crítico</span>
          <strong>{stats.lowStock}</strong>
        </div>
      </article>
      <article className="admin-kpi-card">
        <div className="admin-kpi-icon purple"><TrendingUp aria-hidden="true" size={18} /></div>
        <div>
          <span>Ticket promedio</span>
          <strong>RD$ {stats.avgTicket.toLocaleString("es-DO", { maximumFractionDigits: 0 })}</strong>
        </div>
      </article>
    </section>

    <section className="admin-panel-grid">
      <article className="admin-panel-card admin-panel-wide">
        <div className="admin-panel-head"><div><p className="admin-kicker">GESTIÓN</p><h2>Resumen del día</h2></div><span className="admin-pill"><Activity aria-hidden="true" size={14} /> Operación en vivo</span></div>
        <ul className="admin-metric-list">
          <li><span>Productos activos</span><strong>{stats.publishedProducts}</strong></li>
          <li><span>Pedidos pendientes</span><strong>{orders.filter((order) => order.status === "PENDING").length}</strong></li>
          <li><span>Productos por revisar</span><strong>{products.filter((product) => product.status !== "PUBLISHED").length}</strong></li>
          <li><span>Revisión de stock</span><strong>{stats.lowStock > 0 ? "Requiere acción" : "Estable"}</strong></li>
        </ul>
      </article>

      <article className="admin-panel-card">
        <div className="admin-panel-head"><div><p className="admin-kicker">PEDIDOS</p><h2>Recientes</h2></div><span className="admin-link"><ArrowUpRight aria-hidden="true" size={14} /> Ver todos</span></div>
        <div className="admin-order-list">
          {latestOrders.length === 0 ? <p className="admin-empty-inline">Sin pedidos recientes.</p> : latestOrders.map((order) => (
            <div key={order.id} className="admin-order-item">
              <div>
                <strong>{order.orderNumber}</strong>
                <span>{order.customerName}</span>
              </div>
              <div className="admin-order-meta">
                <span>{order.status}</span>
                <strong>RD$ {Number(order.total ?? 0).toLocaleString("es-DO")}</strong>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  </>}</AdminShell>;
}