import { z } from "zod";
import { requireRequestAdmin } from "@/lib/auth/request";
import { getPrisma } from "@/lib/db/prisma";
import { withCors, preflight } from "@/lib/http/cors";
import { ApiError, errorResponse, json } from "@/lib/http/response";

const updateUserSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio.").max(120).optional(),
  email: z.string().trim().email("Ingresa un email válido.").max(254).optional(),
  role: z.enum(["ADMIN", "EMPLOYEE", "CLIENT"]).optional(),
});

function serializeAdminUser(user: { id: string; name: string; email: string; role: "ADMIN" | "EMPLOYEE"; active: boolean; createdAt: Date }) {
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
    const parsed = updateUserSchema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? "Datos inválidos.");

    const existing = await getPrisma().adminUser.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Usuario no encontrado.");
    if (actor.id === id) throw new ApiError(403, "No puedes modificar tu propio acceso de administrador.");

    const email = parsed.data.email?.trim().toLowerCase();
    if (email && email !== existing.email) {
      const emailTaken = await getPrisma().adminUser.findUnique({ where: { email } });
      if (emailTaken) throw new ApiError(409, "Ya existe un usuario con ese correo.");
    }

    const nextRole = parsed.data.role;
    const data: { name?: string; email?: string; role?: "ADMIN" | "EMPLOYEE"; active?: boolean } = {};
    if (parsed.data.name) data.name = parsed.data.name;
    if (email) data.email = email;

    if (nextRole === "CLIENT") {
      data.role = "EMPLOYEE";
      data.active = false;
      await getPrisma().adminSession.deleteMany({ where: { userId: id } });
    } else if (nextRole) {
      data.role = nextRole;
      data.active = true;
    }

    const user = await getPrisma().adminUser.update({
      where: { id },
      data,
    });

    return withCors(request, json({ data: serializeAdminUser(user) }));
  } catch (error) {
    return withCors(request, errorResponse(error));
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRequestAdmin(["ADMIN"]);
    const { id } = await params;
    if (actor.id === id) throw new ApiError(403, "No puedes eliminar tu propio acceso de administrador.");

    await getPrisma().adminSession.deleteMany({ where: { userId: id } });
    await getPrisma().adminUser.delete({ where: { id } });
    return withCors(request, json({ ok: true }));
  } catch (error) {
    return withCors(request, errorResponse(error));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
