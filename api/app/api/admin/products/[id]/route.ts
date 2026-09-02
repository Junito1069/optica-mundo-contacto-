import { z } from "zod";
import { productSchema } from "@/lib/catalog/validation";
import { serializeProduct } from "@/lib/catalog/serialize";
import { requireRequestAdmin } from "@/lib/auth/request";
import { writeAudit } from "@/lib/audit";
import { getPrisma } from "@/lib/db/prisma";
import { ApiError, errorResponse, json } from "@/lib/http/response";
import { withCors, preflight } from "@/lib/http/cors";
import { readProductBody } from "@/lib/catalog/request";
import { getDatabaseUrl } from "@/lib/env";

export const runtime = "nodejs";
function parseProductId(id: string) {
  if (!z.string().uuid().safeParse(id).success) throw new ApiError(400, "El ID del producto no es un UUID válido.");
  return id;
}

async function updateProduct(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const user = await requireRequestAdmin(); getDatabaseUrl(); const parsed = productSchema.partial().safeParse(await readProductBody(request)); if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? "Datos inválidos."); const { id: rawId } = await params; const id = parseProductId(rawId); const previous = await getPrisma().product.findUnique({ where: { id } }); if (!previous) throw new ApiError(404, "Producto no encontrado."); if (parsed.data.categoryId) { const category = await getPrisma().category.findUnique({ where: { id: parsed.data.categoryId } }); if (!category) throw new ApiError(422, "La categoría seleccionada no existe."); } const product = await getPrisma().product.update({ where: { id }, data: parsed.data, include: { category: true } }); const action = previous.status !== product.status ? product.status === "PUBLISHED" ? "PUBLISH_PRODUCT" : "UNPUBLISH_PRODUCT" : "UPDATE_PRODUCT"; await writeAudit(user.id, action, "Product", id, { status: product.status }); return withCors(request, json({ data: serializeProduct(product) })); } catch (error) { return withCors(request, errorResponse(error)); }
}
export const PATCH = updateProduct;
export const PUT = updateProduct;

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const user = await requireRequestAdmin(["ADMIN"]); const { id: rawId } = await params; const id = parseProductId(rawId); const product = await getPrisma().product.findUnique({ where: { id }, include: { _count: { select: { orderItems: true } } } }); if (!product) throw new ApiError(404, "Producto no encontrado."); if (product._count.orderItems) throw new ApiError(409, "No puedes eliminar un producto asociado a pedidos."); await getPrisma().product.delete({ where: { id } }); await writeAudit(user.id, "DELETE_PRODUCT", "Product", id, { name: product.name }); return withCors(request, json({ ok: true })); } catch (error) { return withCors(request, errorResponse(error)); }
}
export function OPTIONS(request: Request) { return preflight(request); }