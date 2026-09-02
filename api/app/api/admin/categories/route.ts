import { categorySchema } from "@/lib/catalog/validation";
import { serializeCategory } from "@/lib/catalog/serialize";
import { requireRequestAdmin } from "@/lib/auth/request";
import { writeAudit } from "@/lib/audit";
import { getPrisma } from "@/lib/db/prisma";
import { ApiError, errorResponse, json } from "@/lib/http/response";
import { withCors, preflight } from "@/lib/http/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { await requireRequestAdmin(); const categories = await getPrisma().category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } }); return withCors(request, json({ data: categories.map((category) => ({ ...serializeCategory(category), productCount: category._count.products })) })); } catch (error) { return withCors(request, errorResponse(error)); }
}
export async function POST(request: Request) {
  try {
    const user = await requireRequestAdmin(["ADMIN"]); const parsed = categorySchema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? "Datos inválidos.");
    const category = await getPrisma().category.create({ data: parsed.data }); await writeAudit(user.id, "CREATE_CATEGORY", "Category", category.id, { name: category.name });
    return withCors(request, json({ data: serializeCategory(category) }, { status: 201 }));
  } catch (error) { return withCors(request, errorResponse(error)); }
}
export function OPTIONS(request: Request) { return preflight(request); }