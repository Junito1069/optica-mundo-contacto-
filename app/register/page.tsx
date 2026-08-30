import { Suspense } from "react";
import { AuthForm } from "@/components/Auth/AuthForm";
export default function RegisterPage() { return <Suspense fallback={<main className="auth-page" />}><AuthForm mode="register" /></Suspense>; }