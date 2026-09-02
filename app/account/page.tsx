"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?returnUrl=%2Faccount");
      return;
    }

    if (!loading && isAdmin) {
      router.replace("/admin-panel");
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user) return <main className="account-page"><p>Cargando tu cuenta...</p></main>;
  return <main className="account-page"><Link className="brand" href="/">MUNDO <span>CONTACTO</span></Link><p>MI CUENTA</p><h1>Hola, {user.name}.</h1><div className="account-summary"><span>{user.email}</span><span>Mis pedidos aparecerán aquí.</span></div><div className="checkout-actions"><Link className="primary-action" href="/">VOLVER AL INICIO</Link><Link className="secondary-action" href="/account/orders">VER MIS PEDIDOS</Link></div></main>;
}
