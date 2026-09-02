"use client";

import { AdminShell } from "@/components/AdminShell";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api-url";

type Category = { id: string; name: string };
type ProductStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
type Product = {
  id: string; name: string; slug: string; description: string; sku: string; price: number | string;
  stock: number; minimumStock: number; status: ProductStatus; imageUrl: string | null; category: Category; updatedAt: string;
};
type ProductForm = { name: string; slug: string; description: string; categoryId: string; price: string; sku: string; stock: string; minimumStock: string; status: ProductStatus; imageUrl: string };
type ApiError = { error?: string; details?: Array<{ field?: string; message?: string }> };

const initialForm: ProductForm = { name: "", slug: "", description: "", categoryId: "", price: "", sku: "", stock: "0", minimumStock: "0", status: "DRAFT", imageUrl: "" };

function productToForm(product: Product): ProductForm {
  return { name: product.name, slug: product.slug, description: product.description, categoryId: product.category.id, price: String(product.price), sku: product.sku, stock: String(product.stock), minimumStock: String(product.minimumStock), status: product.status, imageUrl: product.imageUrl ?? "" };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadProducts(search = "") {
    const response = await fetch(`${apiUrl}/api/admin/products?q=${encodeURIComponent(search)}`, { credentials: "include", cache: "no-store" });
    if (response.ok) setProducts((await response.json() as { data: Product[] }).data);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadProducts(); void fetch(`${apiUrl}/api/admin/categories`, { credentials: "include", cache: "no-store" }).then(async (response) => response.ok ? response.json() : null).then((payload: { data: Category[] } | null) => setCategories(payload?.data ?? [])); }, []);
  useEffect(() => { const timer = window.setTimeout(() => void loadProducts(query), 250); return () => window.clearTimeout(timer); }, [query]);

  function openCreateForm() { setEditingId(null); setForm(initialForm); setError(""); setShowForm(true); }
  function openEditForm(product: Product) { setEditingId(product.id); setForm(productToForm(product)); setError(""); setShowForm(true); }
  function closeForm() { if (!saving) { setShowForm(false); setEditingId(null); setError(""); } }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!form.imageUrl) { setError("Adjunta una imagen del producto."); return; }
    setSaving(true);
    try {
      const endpoint = editingId ? `${apiUrl}/api/admin/products/${editingId}` : `${apiUrl}/api/admin/products`;
      const response = await fetch(endpoint, { method: editingId ? "PATCH" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock), minimumStock: Number(form.minimumStock) }) });
      const payload = await response.json() as ApiError;
      if (!response.ok) { setError(payload.details?.map((detail) => `${detail.field ?? "campo"}: ${detail.message ?? "inválido"}`).join("; ") ?? payload.error ?? "No fue posible guardar el producto."); return; }
      setForm(initialForm); setEditingId(null); setShowForm(false); void loadProducts(query);
    } catch { setError("No se pudo conectar con el API."); } finally { setSaving(false); }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`¿Eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(product.id); setError("");
    try {
      const response = await fetch(`${apiUrl}/api/admin/products/${product.id}`, { method: "DELETE", credentials: "include" });
      const payload = await response.json() as ApiError;
      if (!response.ok) { setError(payload.error ?? "No fue posible eliminar el producto."); return; }
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch { setError("No se pudo conectar con el API."); } finally { setDeletingId(null); }
  }

  function updateForm(field: keyof ProductForm, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  function updateName(value: string) { updateForm("name", value); if (!editingId) updateForm("slug", value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }
  function readImage(file: File | undefined) {
    if (!file) { updateForm("imageUrl", editingId ? form.imageUrl : ""); return; }
    if (!["image/png", "image/webp", "image/svg+xml"].includes(file.type)) { setError("La imagen debe ser PNG, WebP o SVG."); return; }
    const reader = new FileReader(); reader.onload = () => updateForm("imageUrl", String(reader.result)); reader.readAsDataURL(file);
  }

  return <AdminShell>{() => <>
    <header className="admin-page-header"><div><p className="admin-kicker">CATÁLOGO</p><h1>Productos</h1><span>{products.length} resultados visibles</span></div><button className="admin-primary" onClick={openCreateForm}><Plus aria-hidden="true" size={16} />Nuevo producto</button></header>
    <section className="admin-toolbar"><label><Search aria-hidden="true" size={17} /><span className="sr-only">Buscar productos</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o SKU" /></label></section>
    {error && !showForm && <p className="admin-form-error" role="alert">{error}</p>}
    <section className="admin-table-wrap" aria-label="Productos"><table><thead><tr><th>Producto</th><th>SKU</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><small>Actualizado {new Date(product.updatedAt).toLocaleDateString("es-CO")}</small></td><td>{product.sku}</td><td>{product.category.name}</td><td>${Number(product.price).toLocaleString("es-CO")}</td><td className={product.stock <= product.minimumStock ? "stock-low" : ""}>{product.stock}<small>mín. {product.minimumStock}</small></td><td><span className={`status status-${product.status.toLowerCase()}`}>{product.status === "PUBLISHED" ? "Publicado" : product.status === "DRAFT" ? "Borrador" : "No publicado"}</span></td><td className="product-row-actions"><button type="button" className="icon-button" onClick={() => openEditForm(product)} aria-label={`Editar ${product.name}`}><Pencil aria-hidden="true" size={16} /></button><button type="button" className="icon-button danger" onClick={() => void deleteProduct(product)} disabled={deletingId === product.id} aria-label={`Eliminar ${product.name}`}><Trash2 aria-hidden="true" size={16} /></button></td></tr>)}</tbody></table>{products.length === 0 && <p className="admin-no-results">No hay productos que coincidan con esta búsqueda.</p>}</section>
    {showForm && <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title"><header><div><p className="admin-kicker">CATÁLOGO</p><h2 id="product-form-title">{editingId ? "Editar producto" : "Nuevo producto"}</h2></div><button className="admin-icon-button" onClick={closeForm} aria-label="Cerrar"><X aria-hidden="true" size={20} /></button></header><form onSubmit={saveProduct}><label>Nombre<input required value={form.name} onChange={(event) => updateName(event.target.value)} /></label><label>Slug<input required value={form.slug} onChange={(event) => updateForm("slug", event.target.value)} /></label><label>Descripción<textarea required minLength={10} value={form.description} onChange={(event) => updateForm("description", event.target.value)} /></label><label>Imagen del producto<input required={!editingId} type="file" accept=".png,.webp,.svg,image/png,image/webp,image/svg+xml" onChange={(event) => readImage(event.target.files?.[0])} />{editingId && form.imageUrl && <small>Imagen actual conservada si no seleccionas otra.</small>}</label><div className="admin-form-grid"><label>Categoría<select required value={form.categoryId} onChange={(event) => updateForm("categoryId", event.target.value)}><option value="">Selecciona</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>SKU<input required value={form.sku} onChange={(event) => updateForm("sku", event.target.value)} /></label><label>Precio<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => updateForm("price", event.target.value)} /></label><label>Stock inicial<input required min="0" type="number" value={form.stock} onChange={(event) => updateForm("stock", event.target.value)} /></label><label>Stock mínimo<input required min="0" type="number" value={form.minimumStock} onChange={(event) => updateForm("minimumStock", event.target.value)} /></label><label>Estado<select value={form.status} onChange={(event) => updateForm("status", event.target.value as ProductStatus)}><option value="DRAFT">Borrador</option><option value="PUBLISHED">Publicado</option><option value="UNPUBLISHED">No publicado</option></select></label></div>{error && <p className="admin-form-error" role="alert">{error}</p>}<footer><button type="button" className="admin-secondary" onClick={closeForm}>Cancelar</button><button className="admin-primary" disabled={saving}>{saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear producto"}</button></footer></form></section></div>}
  </>}</AdminShell>;
}
