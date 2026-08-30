import { json, errorResponse } from "@/lib/http/response";
import { withCors, preflight } from "@/lib/http/cors";
import { getCurrentUser } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return withCors(request, json({ error: "No autorizado." }, { status: 401 }));
    const prisma = getPrisma();
    const orders = await prisma.order.findMany({ where: { customerEmail: user.email }, orderBy: { createdAt: "desc" }, include: { items: true } });
    return withCors(request, json({ data: orders }));
  } catch (error) {
    return withCors(request, errorResponse(error));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
