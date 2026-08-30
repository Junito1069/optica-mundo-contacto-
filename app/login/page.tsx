import { Suspense } from "react";
import { AuthForm } from "@/components/Auth/AuthForm";
export default function LoginPage() { return <Suspense fallback={<main className="auth-page" />}><AuthForm mode="login" /></Suspense>; }