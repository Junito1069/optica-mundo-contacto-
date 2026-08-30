import { cookies } from "next/headers";
import { registerCustomer, createCustomerSession, customerSessionCookieName } from "@/lib/auth/customer";
import { customerRegistrationSchema } from "@/lib/auth/customer-validation";
import { withCors, preflight } from "@/lib/http/cors";
import { errorResponse, json } from "@/lib/http/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = customerRegistrationSchema.safeParse(await request.json());
    if (!parsed.success) return withCors(request, json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 }));
    const user = await registerCustomer(parsed.data);
    if (!user) return withCors(request, json({ error: "Ya existe una cuenta con este email." }, { status: 409 }));
    const session = await createCustomerSession(user.id);
    const response = json({ user }, { status: 201 });
    (await cookies()).set(customerSessionCookieName, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/", expires: session.expiresAt });
    return withCors(request, response);
  } catch (error) { return withCors(request, errorResponse(error)); }
}

export function OPTIONS(request: Request) { return preflight(request); }