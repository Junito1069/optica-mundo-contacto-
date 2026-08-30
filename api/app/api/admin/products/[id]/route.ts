import { productSchema } from "@/lib/catalog/validation";
import { serializeProduct } from "@/lib/catalog/serialize";
import { requireRequestAdmin } from "@/lib/auth/request";
import { writeAudit } from "@/lib/audit";
import { getPrisma } from "@/lib/db/prisma";
import { ApiError, errorResponse, json } from "@/lib/http/response";
import { withCors, preflight } from "@/lib/http/cors";

export const runtime = "nodejs";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const user = await requireRequestAdmin(); const parsed = productSchema.partial().safeParse(await request.json()); if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? "Datos inválidos."); const { id } = await params; const previous = await getPrisma().product.findUnique({ where: { id } }); if (!previous) throw new ApiError(404, "Producto no encontrado."); if (parsed.data.categoryId) { const category = await getPrisma().category.findUnique({ where: { id: parsed.data.categoryId } }); if (!category) throw new ApiError(422, "La categoría seleccionada no existe."); } const product = await getPrisma().product.update({ where: { id }, data: parsed.data, include: { category: true } }); const action = previous.status !== product.status ? product.status === "PUBLISHED" ? "PUBLISH_PRODUCT" : "UNPUBLISH_PRODUCT" : "UPDATE_PRODUCT"; await writeAudit(user.id, action, "Product", id, { status: product.status }); return withCors(request, json({ data: serializeProduct(product) })); } catch (error) { return withCors(request, errorResponse(error)); }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const user = await requireRequestAdmin(["ADMIN"]); const { id } = await params; const product = await getPrisma().product.findUnique({ where: { id }, include: { _count: { select: { orderItems: true } } } }); if (!product) throw new ApiError(404, "Producto no encontrado."); if (product._count.orderItems) throw new ApiError(409, "No puedes eliminar un producto asociado a pedidos."); await getPrisma().product.delete({ where: { id } }); await writeAudit(user.id, "DELETE_PRODUCT", "Product", id, { name: product.name }); return withCors(request, json({ ok: true })); } catch (error) { return withCors(request, errorResponse(error)); }
}
export function OPTIONS(request: Request) { return preflight(request); }