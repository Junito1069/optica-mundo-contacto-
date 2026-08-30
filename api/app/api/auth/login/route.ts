import { cookies } from "next/headers";
import { authenticateCustomer, createCustomerSession, customerSessionCookieName } from "@/lib/auth/customer";
import { customerLoginSchema } from "@/lib/auth/customer-validation";
import { withCors, preflight } from "@/lib/http/cors";
import { errorResponse, json } from "@/lib/http/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = customerLoginSchema.safeParse(await request.json());
    if (!parsed.success) return withCors(request, json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 }));
    const user = await authenticateCustomer(parsed.data.email, parsed.data.password);
    if (!user) return withCors(request, json({ error: "Email o contraseña incorrectos." }, { status: 401 }));
    const session = await createCustomerSession(user.id);
    const response = json({ user });
    (await cookies()).set(customerSessionCookieName, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/", expires: session.expiresAt });
    return withCors(request, response);
  } catch (error) { return withCors(request, errorResponse(error)); }
}

export function OPTIONS(request: Request) { return preflight(request); }