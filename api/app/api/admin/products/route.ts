import { productSchema } from "@/lib/catalog/validation";
import { serializeProduct } from "@/lib/catalog/serialize";
import { requireRequestAdmin } from "@/lib/auth/request";
import { writeAudit } from "@/lib/audit";
import { getPrisma } from "@/lib/db/prisma";
import { ApiError, errorResponse, json } from "@/lib/http/response";
import { withCors, preflight } from "@/lib/http/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { await requireRequestAdmin(); const url = new URL(request.url); const query = url.searchParams.get("q")?.trim(); const products = await getPrisma().product.findMany({ where: query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { sku: { contains: query, mode: "insensitive" } }] } : undefined, include: { category: true }, orderBy: { updatedAt: "desc" } }); return withCors(request, json({ data: products.map(serializeProduct) })); } catch (error) { return withCors(request, errorResponse(error)); }
}
export async function POST(request: Request) {
  try {
    const user = await requireRequestAdmin(); const parsed = productSchema.safeParse(await request.json()); if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? "Datos inválidos.");
    const product = await getPrisma().$transaction(async (transaction) => { const category = await transaction.category.findUnique({ where: { id: parsed.data.categoryId } }); if (!category) throw new ApiError(422, "La categoría seleccionada no existe."); const created = await transaction.product.create({ data: parsed.data, include: { category: true } }); if (created.stock > 0) await transaction.inventoryMovement.create({ data: { productId: created.id, userId: user.id, type: "ENTRY", quantity: created.stock, reason: "Stock inicial" } }); return created; });
    await writeAudit(user.id, product.status === "PUBLISHED" ? "PUBLISH_PRODUCT" : "CREATE_PRODUCT", "Product", product.id, { name: product.name, status: product.status }); return withCors(request, json({ data: serializeProduct(product) }, { status: 201 }));
  } catch (error) { return withCors(request, errorResponse(error)); }
}
export function OPTIONS(request: Request) { return preflight(request); }