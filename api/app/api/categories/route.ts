import { getPrisma } from "@/lib/db/prisma";
import { withCors, preflight } from "@/lib/http/cors";
import { errorResponse, json } from "@/lib/http/response";
import { serializeCategory } from "@/lib/catalog/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const categories = await getPrisma().category.findMany({ where: { published: true }, orderBy: { name: "asc" } });
    return withCors(request, json({ data: categories.map(serializeCategory) }));
  } catch (error) { return withCors(request, errorResponse(error)); }
}
export function OPTIONS(request: Request) { return preflight(request); }