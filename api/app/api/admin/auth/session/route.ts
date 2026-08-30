import { cookies } from "next/headers";
import { adminSessionCookieName, getAdminSessionUser } from "@/lib/auth/admin";
import { withCors, preflight } from "@/lib/http/cors";
import { errorResponse, json } from "@/lib/http/response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get(adminSessionCookieName)?.value;
    return withCors(request, json({ user: await getAdminSessionUser(token) }));
  } catch (error) {
    return withCors(request, errorResponse(error));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}