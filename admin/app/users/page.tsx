"use client";

import { AdminShell } from "@/components/AdminShell";
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

type Role = "ADMIN" | "EMPLOYEE" | "CLIENT";
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
};

const emptyForm = { name: "", email: "", role: "EMPLOYEE" as Role };

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadUsers() {
    const response = await fetch(`${apiUrl}/api/admin/users`, { credentials: "include", cache: "no-store" });
    if (!response.ok) {
      setUsers([]);
      return;
    }
    const payload = await response.json() as { data?: UserRow[] };
    setUsers(payload.data ?? []);
  }

  useEffect(() => { void loadUsers(); }, []);

  async function submitUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const endpoint = editingId ? `${apiUrl}/api/admin/users/${editingId}` : `${apiUrl}/api/admin/users`;
      const method = editingId ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "No fue posible guardar el usuario.");
        return;
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadUsers();
    } catch {
      setError("No se pudo conectar con el servicio de usuarios.");
    } finally {
      setSaving(false);
    }
  }

  async function updateRole(userId: string, role: Role) {
    const response = await fetch(`${apiUrl}/api/admin/users/${userId}/role`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const payload = await response.json() as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "No se pudo actualizar el permiso.");
      return;
    }
    await loadUsers();
  }

  async function deleteUser(userId: string) {
    const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, { method: "DELETE", credentials: "include" });
    if (response.ok) await loadUsers();
  }

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => user.role === "ADMIN").length,
    employees: users.filter((user) => user.role === "EMPLOYEE").length,
    clients: users.filter((user) => user.role === "CLIENT").length,
  }), [users]);

  return <AdminShell>{() => <>
    <header className="admin-page-header"><div><p className="admin-kicker">SEGURIDAD</p><h1>Usuarios</h1><span>{stats.total} usuarios registrados</span></div><button className="admin-primary" onClick={() => { setEditingId(null); setForm(emptyForm); setError(""); }}><Plus aria-hidden="true" size={16} />Nuevo usuario</button></header>

    <section className="admin-kpi-grid">
      <article className="admin-kpi-card"><div className="admin-kpi-icon blue"><UserCog aria-hidden="true" size={18} /></div><div><span>Total</span><strong>{stats.total}</strong></div></article>
      <article className="admin-kpi-card"><div className="admin-kpi-icon green"><UserCog aria-hidden="true" size={18} /></div><div><span>Admins</span><strong>{stats.admins}</strong></div></article>
      <article className="admin-kpi-card"><div className="admin-kpi-icon orange"><UserCog aria-hidden="true" size={18} /></div><div><span>Empleados</span><strong>{stats.employees}</strong></div></article>
      <article className="admin-kpi-card"><div className="admin-kpi-icon purple"><UserCog aria-hidden="true" size={18} /></div><div><span>Clientes</span><strong>{stats.clients}</strong></div></article>
    </section>

    <section className="admin-content-panel">
      <form onSubmit={submitUser} className="admin-form-card">
        <h2>{editingId ? "Editar usuario" : "Crear usuario"}</h2>
        <div className="admin-form-grid">
          <label>Nombre<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Rol<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}><option value="ADMIN">Administrador</option><option value="EMPLOYEE">Empleado</option><option value="CLIENT">Cliente</option></select></label>
        </div>
        {error && <p className="admin-form-error">{error}</p>}
        <div className="admin-form-actions">
          <button type="button" className="admin-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); setError(""); }}>Cancelar</button>
          <button type="submit" className="admin-primary" disabled={saving}>{saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}</button>
        </div>
      </form>

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong><small>{user.email}</small></td>
                <td>
                  <select value={user.role} onChange={(event) => void updateRole(user.id, event.target.value as Role)}>
                    <option value="ADMIN">Administrador</option>
                    <option value="EMPLOYEE">Empleado</option>
                    <option value="CLIENT">Cliente</option>
                  </select>
                </td>
                <td><span className={`status ${user.active ? "status-published" : "status-unpublished"}`}>{user.active ? "Activo" : "Inactivo"}</span></td>
                <td className="row-actions">
                  <button type="button" className="icon-button" onClick={() => { setEditingId(user.id); setForm({ name: user.name, email: user.email, role: user.role }); setError(""); }}><Pencil aria-hidden="true" size={16} /></button>
                  <button type="button" className="icon-button danger" onClick={() => void deleteUser(user.id)}><Trash2 aria-hidden="true" size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </>}</AdminShell>;
}
