import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireRequestAdmin } from "@/lib/auth/request";
import { getPrisma } from "@/lib/db/prisma";
import { withCors, preflight } from "@/lib/http/cors";
import { ApiError, errorResponse, json } from "@/lib/http/response";

const createUserSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio.").max(120),
  email: z.string().trim().email("Ingresa un email válido.").max(254),
  role: z.enum(["ADMIN", "EMPLOYEE", "CLIENT"]).default("EMPLOYEE"),
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
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireRequestAdmin(["ADMIN", "EMPLOYEE"]);
    const users = await getPrisma().adminUser.findMany({ orderBy: { createdAt: "desc" } });
    return withCors(request, json({ data: users.map((user) => serializeAdminUser(user)) }));
  } catch (error) {
    return withCors(request, errorResponse(error));
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireRequestAdmin(["ADMIN"]);
    const parsed = createUserSchema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? "Datos inválidos.");

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const existing = await getPrisma().adminUser.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new ApiError(409, "Ya existe un usuario con ese correo.");

    const passwordHash = await bcrypt.hash(`${randomBytes(8).toString("hex")}-Opticaa!`, 12);
    const role = parsed.data.role === "CLIENT" ? "EMPLOYEE" : parsed.data.role;
    const active = parsed.data.role !== "CLIENT";

    const user = await getPrisma().adminUser.create({
      data: {
        name: parsed.data.name,
        email: normalizedEmail,
        passwordHash,
        role,
        active,
      },
    });

    return withCors(request, json({ data: serializeAdminUser(user) }, { status: 201 }));
  } catch (error) {
    return withCors(request, errorResponse(error));
  }
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
