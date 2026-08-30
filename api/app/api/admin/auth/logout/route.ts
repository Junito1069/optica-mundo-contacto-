import { cookies } from "next/headers";
import { adminSessionCookieName, destroyAdminSession } from "@/lib/auth/admin";
import { withCors, preflight } from "@/lib/http/cors";
import { errorResponse, json } from "@/lib/http/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    await destroyAdminSession(cookieStore.get(adminSessionCookieName)?.value);
    const response = json({ ok: true });
    response.cookies.set(adminSessionCookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/", maxAge: 0 });
    return withCors(request, response);
  } catch (error) {
    return withCors(request, errorResponse(error));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}