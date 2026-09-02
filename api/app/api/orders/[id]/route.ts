import { withCors, preflight } from "@/lib/http/cors";
import { json, errorResponse } from "@/lib/http/response";
import { getCurrentUser } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    if (!user) return withCors(request, json({ error: "No autorizado." }, { status: 401 }));
    const prisma = getPrisma();
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return withCors(request, json({ error: "Pedido no encontrado." }, { status: 404 }));
    if (order.customerEmail !== user.email) return withCors(request, json({ error: "No permitido." }, { status: 403 }));
    return withCors(request, json({ data: order }));
  } catch (error) {
    return withCors(request, errorResponse(error));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
