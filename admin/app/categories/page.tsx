"use client";

import { AdminShell } from "@/components/AdminShell";
import { Eye, EyeOff, Plus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
type Category = { id: string; name: string; slug: string; description: string | null; published: boolean; productCount: number };
const initialForm = { name: "", slug: "", description: "", published: false };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    const response = await fetch(`${apiUrl}/api/admin/categories`, { credentials: "include", cache: "no-store" });
    if (response.ok) setCategories((await response.json() as { data: Category[] }).data);
  }

  useEffect(() => { void loadCategories(); }, []);

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/categories`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) { setError(payload.error ?? "No fue posible crear la categoría."); return; }
      setForm(initialForm); setShowForm(false); void loadCategories();
    } catch { setError("No se pudo conectar con el API."); } finally { setSaving(false); }
  }

  async function togglePublished(category: Category) {
    const response = await fetch(`${apiUrl}/api/admin/categories/${category.id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !category.published }) });
    if (response.ok) void loadCategories();
  }

  return <AdminShell>{(user) => <>
    <header className="admin-page-header"><div><p className="admin-kicker">CATÁLOGO</p><h1>Categorías</h1><span>{categories.length} categorías configuradas</span></div>{user.role === "ADMIN" && <button className="admin-primary" onClick={() => setShowForm(true)}><Plus aria-hidden="true" size={16} />Nueva categoría</button>}</header>
    <section className="admin-category-grid">{categories.map((category) => <article key={category.id} className="admin-category"><div><p className="admin-kicker">{category.published ? "Visible en tienda" : "No publicada"}</p><h2>{category.name}</h2><p>{category.description || "Sin descripción"}</p></div><footer><span>{category.productCount} {category.productCount === 1 ? "producto" : "productos"}</span>{user.role === "ADMIN" && <button className="admin-secondary" onClick={() => void togglePublished(category)}>{category.published ? <EyeOff aria-hidden="true" size={15} /> : <Eye aria-hidden="true" size={15} />}{category.published ? "Ocultar" : "Publicar"}</button>}</footer></article>)}</section>
    {categories.length === 0 && <p className="admin-no-results">No hay categorías registradas.</p>}
    {showForm && <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="new-category-title"><header><div><p className="admin-kicker">CATÁLOGO</p><h2 id="new-category-title">Nueva categoría</h2></div></header><form onSubmit={createCategory}><label>Nombre<input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: event.target.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} /></label><label>Slug<input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label><label>Descripción<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="admin-check"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} />Publicar en la tienda</label>{error && <p className="admin-form-error" role="alert">{error}</p>}<footer><button type="button" className="admin-secondary" onClick={() => setShowForm(false)}>Cancelar</button><button className="admin-primary" disabled={saving}>{saving ? "Guardando..." : "Crear categoría"}</button></footer></form></section></div>}
  </>}</AdminShell>;
}