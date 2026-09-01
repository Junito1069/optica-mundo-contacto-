"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";
import { apiUrl } from "@/lib/api-url";

function resolvePostLoginRoute(role?: string | null, fallbackUrl?: string | null) {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === "admin" || normalizedRole === "administrador" || normalizedRole === "empleado" || normalizedRole === "employee") {
    return "/admin-panel";
  }

  if (normalizedRole === "cliente" || normalizedRole === "customer") {
    return "/dashboard-usuario";
  }

  return fallbackUrl ?? "/account";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const search = useSearchParams();
  const returnUrl = search?.get("returnUrl") ?? null;
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/${isRegister ? "register" : "login"}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isRegister ? { name, email, password } : { email, password }) });
      const payload = await response.json() as { error?: string; user?: { role?: string } };

      if (!response.ok) {
        setError(payload.error ?? "No fue posible completar la solicitud.");
        return;
      }

      await refresh();
      const target = resolvePostLoginRoute(payload.user?.role, returnUrl);
      router.replace(target);
      router.refresh();
    } catch {
      setError("No pudimos conectar con el servidor. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-page"><section className="auth-panel"><Link className="brand" href="/">MUNDO <span>CONTACTO</span></Link><div className="auth-heading"><p>{isRegister ? "CREA TU CUENTA" : "BIENVENIDO DE NUEVO"}</p><h1>{isRegister ? "Comienza a ver con claridad." : "Welcome back."}</h1></div><form onSubmit={submit} noValidate>{isRegister && <label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Contraseña<span className="password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} minLength={8} required /><button type="button" onClick={() => setShowPassword((show) => !show)}>{showPassword ? "OCULTAR" : "MOSTRAR"}</button></span></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-action" disabled={loading}>{loading ? "PROCESANDO..." : isRegister ? "CREAR CUENTA" : "SIGN IN"}</button></form>{!isRegister && <a className="auth-text-link" href="mailto:soporte@mundocontacto.com?subject=Recuperar%20contraseña">¿Olvidaste tu contraseña?</a>}<p className="auth-switch">{isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Inicia sesión" : "Crea una cuenta"}</Link></p></section></main>;
}