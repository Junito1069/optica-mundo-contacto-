"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <main className="account-page"><p>Cargando tu cuenta...</p></main>;
  return <main className="account-page"><p>MI CUENTA</p><h1>Hola, {user.name}.</h1><div className="account-summary"><span>{user.email}</span><span>Mis pedidos aparecerán aquí.</span></div></main>;
}
