import { withCors, preflight } from "@/lib/http/cors";
import { json, errorResponse } from "@/lib/http/response";
import { getAdminSessionUser } from "@/lib/auth/admin";
import { cookies } from "next/headers";
import { getPrisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get("mundo_contacto_admin_session")?.value;
    const admin = await getAdminSessionUser(token);
    if (!admin) return withCors(request, json({ error: "No autorizado." }, { status: 401 }));

    const prisma = getPrisma();
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });
    const serializedOrders = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      shippingTotal: Number(order.shippingTotal),
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice), total: Number(item.total) })),
    }));
    return withCors(request, json({ success: true, data: serializedOrders }));
  } catch (error) {
    if (error instanceof Error && /DATABASE_URL|Prisma|connection|env/i.test(error.message)) {
      return withCors(request, json({ error: "La base de datos no está configurada o no está disponible en este momento." }, { status: 503 }));
    }
    return withCors(request, errorResponse(error));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
