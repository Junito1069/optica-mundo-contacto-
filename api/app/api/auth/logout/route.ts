import { cookies } from "next/headers";
import { customerSessionCookieName, destroyCustomerSession } from "@/lib/auth/customer";
import { withCors, preflight } from "@/lib/http/cors";
import { errorResponse, json } from "@/lib/http/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    await destroyCustomerSession(cookieStore.get(customerSessionCookieName)?.value);
    cookieStore.delete(customerSessionCookieName);
    return withCors(request, json({ ok: true }));
  } catch (error) { return withCors(request, errorResponse(error)); }
}

export function OPTIONS(request: Request) { return preflight(request); }