import { categorySchema } from "@/lib/catalog/validation";
import { serializeCategory } from "@/lib/catalog/serialize";
import { requireRequestAdmin } from "@/lib/auth/request";
import { writeAudit } from "@/lib/audit";
import { getPrisma } from "@/lib/db/prisma";
import { ApiError, errorResponse, json } from "@/lib/http/response";
import { withCors, preflight } from "@/lib/http/cors";

export const runtime = "nodejs";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const user = await requireRequestAdmin(["ADMIN"]); const parsed = categorySchema.partial().safeParse(await request.json()); if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? "Datos inválidos."); const { id } = await params; const category = await getPrisma().category.update({ where: { id }, data: parsed.data }); await writeAudit(user.id, "UPDATE_CATEGORY", "Category", id, parsed.data); return withCors(request, json({ data: serializeCategory(category) })); } catch (error) { return withCors(request, errorResponse(error)); }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const user = await requireRequestAdmin(["ADMIN"]); const { id } = await params; const category = await getPrisma().category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } }); if (!category) throw new ApiError(404, "Categoría no encontrada."); if (category._count.products) throw new ApiError(409, "No puedes eliminar una categoría que contiene productos."); await getPrisma().category.delete({ where: { id } }); await writeAudit(user.id, "DELETE_CATEGORY", "Category", id, { name: category.name }); return withCors(request, json({ ok: true })); } catch (error) { return withCors(request, errorResponse(error)); }
}
export function OPTIONS(request: Request) { return preflight(request); }