import { getPrisma } from "@/lib/db/prisma";
import { withCors, preflight } from "@/lib/http/cors";
import { ApiError, errorResponse, json } from "@/lib/http/response";
import { serializeProduct } from "@/lib/catalog/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await getPrisma().product.findFirst({ where: { slug, status: "PUBLISHED", category: { published: true } }, include: { category: true } });
    if (!product) throw new ApiError(404, "Producto no encontrado.");
    return withCors(request, json({ data: serializeProduct(product) }));
  } catch (error) { return withCors(request, errorResponse(error)); }
}

export function OPTIONS(request: Request) { return preflight(request); }