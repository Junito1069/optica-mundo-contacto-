import { z } from "zod";
import { requireRequestAdmin } from "@/lib/auth/request";
import { getPrisma } from "@/lib/db/prisma";
import { withCors, preflight } from "@/lib/http/cors";
import { ApiError, errorResponse, json } from "@/lib/http/response";

const roleSchema = z.object({ role: z.enum(["ADMIN", "EMPLOYEE", "CLIENT"]) });

type DbAdminRole = "ADMIN" | "EMPLOYEE";

function serializeAdminUser(user: { id: string; name: string; email: string; role: DbAdminRole; active: boolean; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.active ? user.role : "CLIENT",
    active: user.active,
    createdAt: user.createdAt.toISOString(),
  };
}

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRequestAdmin(["ADMIN"]);
    const { id } = await params;
    const parsed = roleSchema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? "Datos inválidos.");

    const existing = await getPrisma().adminUser.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Usuario no encontrado.");
    if (actor.id === id) throw new ApiError(403, "No puedes cambiar tu propio rol de administrador.");

    const isClient = parsed.data.role === "CLIENT";
    const nextRole: DbAdminRole = isClient
      ? "EMPLOYEE"
      : parsed.data.role === "ADMIN" || parsed.data.role === "EMPLOYEE"
        ? parsed.data.role
        : "EMPLOYEE";

    const user = await getPrisma().adminUser.update({
      where: { id },
      data: {
        role: nextRole,
        active: !isClient,
      },
    });

    if (isClient) {
      await getPrisma().adminSession.deleteMany({ where: { userId: id } });
    }

    return withCors(request, json({ data: serializeAdminUser(user) }));
  } catch (error) {
    return withCors(request, errorResponse(error));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
