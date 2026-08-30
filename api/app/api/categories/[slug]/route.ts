import { ApiError, errorResponse, json } from "@/lib/http/response";
import { getPrisma } from "@/lib/db/prisma";
import { withCors, preflight } from "@/lib/http/cors";
import { serializeCategory } from "@/lib/catalog/serialize";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const category = await getPrisma().category.findFirst({ where: { slug, published: true } });
    if (!category) throw new ApiError(404, "Categoría no encontrada.");
    return withCors(request, json({ data: serializeCategory(category) }));
  } catch (error) { return withCors(request, errorResponse(error)); }
}
export function OPTIONS(request: Request) { return preflight(request); }