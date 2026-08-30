import { getPrisma } from "@/lib/db/prisma";
import { withCors, preflight } from "@/lib/http/cors";
import { errorResponse, json } from "@/lib/http/response";
import { serializeProduct } from "@/lib/catalog/serialize";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim();
    const category = url.searchParams.get("category")?.trim();
    const products = await getPrisma().product.findMany({
      where: { status: "PUBLISHED", category: { published: true }, ...(category ? { category: { slug: category, published: true } } : {}), ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { brand: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { sku: { contains: query, mode: "insensitive" } }] } : {}) },
      include: { category: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return withCors(request, json({ data: products.map(serializeProduct) }));
  } catch (error) { return withCors(request, errorResponse(error)); }
}
export function OPTIONS(request: Request) { return preflight(request); }