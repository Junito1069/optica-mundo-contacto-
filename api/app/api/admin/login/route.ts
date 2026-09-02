import { authenticateAdmin, adminSessionCookieName, createAdminSession } from "@/lib/auth/admin";
import { adminLoginSchema } from "@/lib/auth/validation";
import { withCors, preflight } from "@/lib/http/cors";
import { errorResponse, json } from "@/lib/http/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const parsed = adminLoginSchema.safeParse(await request.json());
    if (!parsed.success) return withCors(request, json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 }));

    const user = await authenticateAdmin(parsed.data.email, parsed.data.password);
    if (!user) return withCors(request, json({ error: "Email o contraseña incorrectos." }, { status: 401 }));

    const session = await createAdminSession(user.id);
    const response = json({ user });
    response.cookies.set(adminSessionCookieName, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      expires: session.expiresAt,
    });
    return withCors(request, response);
  } catch (error) {
    return withCors(request, errorResponse(error));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
