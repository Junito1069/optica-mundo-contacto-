"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiUrl } from "@/lib/api-url";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "No fue posible iniciar sesión.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
      window.location.assign("/dashboard");
    } catch {
      setError("No se pudo conectar con el servidor administrativo.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="admin-login-page">
    <section className="admin-login-panel" aria-labelledby="admin-login-title">
      <p className="admin-brand">MUNDO <span>CONTACTO</span></p>
      <div className="admin-login-heading">
        <p>ADMINISTRACIÓN</p>
        <h1 id="admin-login-title">INICIAR<br /><em>SESIÓN.</em></h1>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <label>EMAIL<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label>CONTRASEÑA<span className="admin-password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" minLength={8} required /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? "OCULTAR" : "MOSTRAR"}</button></span></label>
        {error && <p className="admin-form-error" role="alert">{error}</p>}
        <button className="admin-submit" disabled={loading}>{loading ? "VERIFICANDO..." : "ENTRAR AL PANEL"}</button>
      </form>
    </section>
  </main>;
}