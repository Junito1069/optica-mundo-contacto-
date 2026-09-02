import { withCors, preflight } from "@/lib/http/cors";
import { json } from "@/lib/http/response";
import { getDatabaseUrl } from "@/lib/env";
import { getPrisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    getDatabaseUrl();
    await getPrisma().$queryRaw`SELECT 1`;
    return withCors(request, json({ api: "ok", database: "ok" }));
  } catch (error) {
    console.error("Health check database failed", error);
    const notConfigured = error instanceof Error && error.message === "La base de datos no está configurada.";
    return withCors(request, json({ api: "ok", database: "error", code: notConfigured ? "DATABASE_NOT_CONFIGURED" : "DATABASE_UNAVAILABLE" }, { status: 503 }));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}