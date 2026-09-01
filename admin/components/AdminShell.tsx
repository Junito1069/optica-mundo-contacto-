"use client";

import Link from "next/link";
import { Boxes, FileText, LayoutDashboard, LogOut, PackageSearch, Tags, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/api-url";
type AdminUser = { name: string; email: string; role: "ADMIN" | "EMPLOYEE" };

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Productos", icon: PackageSearch },
  { href: "/categories", label: "Categorías", icon: Tags },
  { href: "/orders", label: "Pedidos", icon: PackageSearch },
  { href: "/inventory", label: "Inventario", icon: Boxes },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/formulas", label: "Fórmulas", icon: FileText },
];

export function AdminShell({ children }: { children: (user: AdminUser) => React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let mounted = true;
    void fetch(`${apiUrl}/api/admin/auth/session`, { credentials: "include", cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ user: AdminUser | null }> : { user: null })
      .then((payload) => {
        if (!payload.user) router.replace("/login");
        else if (mounted) setUser(payload.user);
      })
      .catch(() => router.replace("/login"));
    return () => { mounted = false; };
  }, [router]);

  async function logout() {
    await fetch(`${apiUrl}/api/admin/auth/logout`, { method: "POST", credentials: "include" });
    router.replace("/login");
  }

  if (!user) return <main className="admin-loading">CARGANDO SESIÓN...</main>;

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <Link className="admin-brand" href="/dashboard">MUNDO <span>CONTACTO</span></Link>
      <p className="admin-mode">ADMINISTRACIÓN</p>
      <nav aria-label="Navegación administrativa">
        {navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname === href ? "active" : ""}><Icon aria-hidden="true" size={16} />{label}</Link>)}
      </nav>
      <div className="admin-sidebar-user"><strong>{user.name}</strong><span>{user.role}</span></div>
      <button onClick={() => void logout()} className="admin-logout"><LogOut aria-hidden="true" size={15} />Cerrar sesión</button>
    </aside>
    <section className="admin-content">{children(user)}</section>
  </main>;
}