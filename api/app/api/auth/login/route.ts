import { cookies } from "next/headers";
import { authenticateCustomer, createCustomerSession, customerSessionCookieName } from "@/lib/auth/customer";
import { customerLoginSchema } from "@/lib/auth/customer-validation";
import { withCors, preflight } from "@/lib/http/cors";
import { errorResponse, json } from "@/lib/http/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    const parsed = customerLoginSchema.safeParse(rawBody);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      console.error("Customer login validation failed:", parsed.error.issues);
      return withCors(request, json({
        error: issue?.message ?? "Datos inválidos.",
        details: parsed.error.issues.map((item) => ({ field: item.path.join("."), message: item.message })),
      }, { status: 400 }));
    }
    const user = await authenticateCustomer(parsed.data.email, parsed.data.password);
    if (!user) return withCors(request, json({ error: "Email o contraseña incorrectos." }, { status: 401 }));
    const session = await createCustomerSession(user.id);
    const response = json({ user });
    (await cookies()).set(customerSessionCookieName, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/", expires: session.expiresAt });
    return withCors(request, response);
  } catch (error) { return withCors(request, errorResponse(error)); }
}

export function OPTIONS(request: Request) { return preflight(request); }