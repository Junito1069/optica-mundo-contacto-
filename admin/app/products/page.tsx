"use client";

import { AdminShell } from "@/components/AdminShell";
import { Plus, Search, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
type Category = { id: string; name: string };
type Product = { id: string; name: string; sku: string; price: string; stock: number; minimumStock: number; status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED"; category: Category; updatedAt: string };
const initialForm = { name: "", slug: "", description: "", categoryId: "", price: "", sku: "", stock: "0", minimumStock: "0", status: "DRAFT" };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadProducts(search = "") {
    const response = await fetch(`${apiUrl}/api/admin/products?q=${encodeURIComponent(search)}`, { credentials: "include", cache: "no-store" });
    if (response.ok) setProducts((await response.json() as { data: Product[] }).data);
  }

  useEffect(() => { void loadProducts(); void fetch(`${apiUrl}/api/admin/categories`, { credentials: "include", cache: "no-store" }).then(async (response) => response.ok ? response.json() : null).then((payload: { data: Category[] } | null) => setCategories(payload?.data ?? [])); }, []);

  useEffect(() => { const timer = window.setTimeout(() => void loadProducts(query), 250); return () => window.clearTimeout(timer); }, [query]);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/products`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock), minimumStock: Number(form.minimumStock) }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) { setError(payload.error ?? "No fue posible crear el producto."); return; }
      setForm(initialForm); setShowForm(false); void loadProducts(query);
    } catch { setError("No se pudo conectar con el API."); } finally { setSaving(false); }
  }

  return <AdminShell>{() => <>
    <header className="admin-page-header"><div><p className="admin-kicker">CATÁLOGO</p><h1>Productos</h1><span>{products.length} resultados visibles</span></div><button className="admin-primary" onClick={() => setShowForm(true)}><Plus aria-hidden="true" size={16} />Nuevo producto</button></header>
    <section className="admin-toolbar"><label><Search aria-hidden="true" size={17} /><span className="sr-only">Buscar productos</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o SKU" /></label></section>
    <section className="admin-table-wrap" aria-label="Productos"><table><thead><tr><th>Producto</th><th>SKU</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><small>Actualizado {new Date(product.updatedAt).toLocaleDateString("es-CO")}</small></td><td>{product.sku}</td><td>{product.category.name}</td><td>${Number(product.price).toLocaleString("es-CO")}</td><td className={product.stock <= product.minimumStock ? "stock-low" : ""}>{product.stock}<small>mín. {product.minimumStock}</small></td><td><span className={`status status-${product.status.toLowerCase()}`}>{product.status === "PUBLISHED" ? "Publicado" : product.status === "DRAFT" ? "Borrador" : "No publicado"}</span></td></tr>)}</tbody></table>{products.length === 0 && <p className="admin-no-results">No hay productos que coincidan con esta búsqueda.</p>}</section>
    {showForm && <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="new-product-title"><header><div><p className="admin-kicker">CATÁLOGO</p><h2 id="new-product-title">Nuevo producto</h2></div><button className="admin-icon-button" onClick={() => setShowForm(false)} aria-label="Cerrar"><X aria-hidden="true" size={20} /></button></header><form onSubmit={createProduct}><label>Nombre<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: event.target.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} /></label><label>Slug<input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label><label>Descripción<textarea required minLength={10} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="admin-form-grid"><label>Categoría<select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}><option value="">Selecciona</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>SKU<input required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} /></label><label>Precio<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><label>Stock inicial<input required min="0" type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></label><label>Stock mínimo<input required min="0" type="number" value={form.minimumStock} onChange={(event) => setForm({ ...form, minimumStock: event.target.value })} /></label><label>Estado<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="DRAFT">Borrador</option><option value="PUBLISHED">Publicado</option><option value="UNPUBLISHED">No publicado</option></select></label></div>{error && <p className="admin-form-error" role="alert">{error}</p>}<footer><button type="button" className="admin-secondary" onClick={() => setShowForm(false)}>Cancelar</button><button className="admin-primary" disabled={saving}>{saving ? "Guardando..." : "Crear producto"}</button></footer></form></section></div>}
  </>}</AdminShell>;
}