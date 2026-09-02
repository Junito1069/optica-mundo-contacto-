import { withCors, preflight } from "@/lib/http/cors";
import { json } from "@/lib/http/response";
import { serverEnv } from "@/lib/env";
import { getPrisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!serverEnv.DATABASE_URL) {
    return withCors(request, json({ api: "ok", database: "error" }, { status: 503 }));
  }

  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return withCors(request, json({ api: "ok", database: "ok" }));
  } catch (error) {
    console.error("Health check database failed", error);
    return withCors(request, json({ api: "ok", database: "error" }, { status: 503 }));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}