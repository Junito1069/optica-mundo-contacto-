import { inventoryMovementSchema } from "@/lib/catalog/validation";
import { requireRequestAdmin } from "@/lib/auth/request";
import { writeAudit } from "@/lib/audit";
import { getPrisma } from "@/lib/db/prisma";
import { ApiError, errorResponse, json } from "@/lib/http/response";
import { withCors, preflight } from "@/lib/http/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await requireRequestAdmin();
    const { productId } = await params;
    const product = await getPrisma().product.findUnique({ where: { id: productId }, select: { id: true, name: true, sku: true, stock: true, minimumStock: true } });
    if (!product) throw new ApiError(404, "Producto no encontrado.");
    const movements = await getPrisma().inventoryMovement.findMany({ where: { productId }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 });
    return withCors(request, json({ data: { product, movements: movements.map((movement) => ({ id: movement.id, type: movement.type, quantity: movement.quantity, reason: movement.reason, userName: movement.user?.name ?? null, createdAt: movement.createdAt.toISOString() })) } }));
  } catch (error) { return withCors(request, errorResponse(error)); }
}
export async function POST(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try { const user = await requireRequestAdmin(); const parsed = inventoryMovementSchema.safeParse(await request.json()); if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? "Datos inválidos."); const { productId } = await params; const result = await getPrisma().$transaction(async (transaction) => { const product = await transaction.product.findUnique({ where: { id: productId } }); if (!product) throw new ApiError(404, "Producto no encontrado."); const stockChange = parsed.data.type === "ADJUSTMENT" ? parsed.data.quantity - product.stock : parsed.data.type === "EXIT" ? -Math.abs(parsed.data.quantity) : Math.abs(parsed.data.quantity); const nextStock = product.stock + stockChange; if (nextStock < 0) throw new ApiError(409, "No puedes dejar el inventario en negativo."); const updated = await transaction.product.update({ where: { id: productId }, data: { stock: nextStock } }); const movement = await transaction.inventoryMovement.create({ data: { productId, userId: user.id, type: parsed.data.type, quantity: stockChange, reason: parsed.data.reason } }); return { product: updated, movement }; }); await writeAudit(user.id, `STOCK_${parsed.data.type}`, "Product", productId, { quantity: result.movement.quantity, stock: result.product.stock }); return withCors(request, json({ data: { stock: result.product.stock, movement: { id: result.movement.id, type: result.movement.type, quantity: result.movement.quantity, reason: result.movement.reason, createdAt: result.movement.createdAt.toISOString() } } })); } catch (error) { return withCors(request, errorResponse(error)); }
}
export function OPTIONS(request: Request) { return preflight(request); }