import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { withCors, preflight } from "@/lib/http/cors";
import { errorResponse, json } from "@/lib/http/response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try { return withCors(request, json({ user: await getCurrentUser() })); }
  catch (error) { return withCors(request, errorResponse(error)); }
}

export function OPTIONS(request: Request) { return preflight(request); }