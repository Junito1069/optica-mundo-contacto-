"use client";

import { AdminShell } from "@/components/AdminShell";
import { ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
type Product = { id: string; name: string; sku: string; stock: number; minimumStock: number };
type Movement = { id: string; type: "ENTRY" | "EXIT" | "ADJUSTMENT"; quantity: number; reason: string; userName: string | null; createdAt: string };
type InventoryData = { product: Product; movements: Movement[] };

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [type, setType] = useState<Movement["type"]>("ENTRY");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadInventory(id: string) {
    if (!id) { setInventory(null); return; }
    const response = await fetch(`${apiUrl}/api/admin/inventory/${id}`, { credentials: "include", cache: "no-store" });
    if (response.ok) setInventory((await response.json() as { data: InventoryData }).data);
  }

  useEffect(() => { void fetch(`${apiUrl}/api/admin/products`, { credentials: "include", cache: "no-store" }).then(async (response) => response.ok ? response.json() : null).then((payload: { data: Product[] } | null) => { const nextProducts = payload?.data ?? []; setProducts(nextProducts); if (nextProducts[0]) setProductId(nextProducts[0].id); }); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadInventory(productId); }, [productId]);

  async function submitMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!productId) return; setError(""); setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/inventory/${productId}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, quantity: Number(quantity), reason }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) { setError(payload.error ?? "No fue posible registrar el movimiento."); return; }
      setQuantity(""); setReason(""); void loadInventory(productId);
    } catch { setError("No se pudo conectar con el API."); } finally { setSaving(false); }
  }

  const stockClass = inventory && inventory.product.stock <= inventory.product.minimumStock ? "stock-low" : "";
  return <AdminShell>{() => <>
    <header className="admin-page-header"><div><p className="admin-kicker">OPERACIONES</p><h1>Inventario</h1><span>Movimientos con trazabilidad por producto</span></div></header>
    <section className="inventory-layout"><div className="inventory-main"><label className="inventory-picker">Producto<select value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}</select></label>{inventory && <><section className="stock-summary"><div><span>Stock disponible</span><strong className={stockClass}>{inventory.product.stock}</strong></div><div><span>Stock mínimo</span><strong>{inventory.product.minimumStock}</strong></div><div><span>Estado</span><strong>{inventory.product.stock <= inventory.product.minimumStock ? "Reponer" : "Disponible"}</strong></div></section><section className="admin-table-wrap"><table><thead><tr><th>Tipo</th><th>Cantidad</th><th>Motivo</th><th>Registrado por</th><th>Fecha</th></tr></thead><tbody>{inventory.movements.map((movement) => <tr key={movement.id}><td><span className={`movement movement-${movement.type.toLowerCase()}`}>{movement.type === "ENTRY" ? "Entrada" : movement.type === "EXIT" ? "Salida" : "Ajuste"}</span></td><td className={movement.quantity < 0 ? "stock-low" : ""}>{movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}</td><td>{movement.reason}</td><td>{movement.userName ?? "Sistema"}</td><td>{new Date(movement.createdAt).toLocaleString("es-CO")}</td></tr>)}</tbody></table>{inventory.movements.length === 0 && <p className="admin-no-results">Este producto no tiene movimientos registrados.</p>}</section></>}</div><aside className="inventory-action"><p className="admin-kicker">REGISTRAR MOVIMIENTO</p><h2>Actualizar stock</h2><form onSubmit={submitMovement}><label>Tipo de movimiento<select value={type} onChange={(event) => setType(event.target.value as Movement["type"])}><option value="ENTRY">Entrada</option><option value="EXIT">Salida</option><option value="ADJUSTMENT">Ajuste a cantidad final</option></select></label><label>{type === "ADJUSTMENT" ? "Cantidad final" : "Unidades"}<input required type="number" min={type === "EXIT" ? "1" : undefined} value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label><label>Motivo<textarea required minLength={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ej. Recepción de proveedor" /></label>{error && <p className="admin-form-error" role="alert">{error}</p>}<button className="admin-primary" disabled={saving}>{type === "ENTRY" ? <ArrowDownToLine aria-hidden="true" size={16} /> : type === "EXIT" ? <ArrowUpFromLine aria-hidden="true" size={16} /> : <SlidersHorizontal aria-hidden="true" size={16} />}{saving ? "Guardando..." : "Registrar movimiento"}</button></form></aside></section>
  </>}</AdminShell>;
}