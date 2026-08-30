import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { AdminRole } from "@/generated/prisma/enums";
import { getPrisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/http/response";

export const adminSessionCookieName = "mundo_contacto_admin_session";
const sessionDurationMs = 1000 * 60 * 60 * 12;

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toSessionUser(user: AdminSessionUser): AdminSessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function authenticateAdmin(email: string, password: string) {
  const prisma = getPrisma();
  const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return toSessionUser(user);
}

export async function createAdminSession(userId: string) {
  const prisma = getPrisma();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  await prisma.$transaction([
    prisma.adminSession.deleteMany({ where: { OR: [{ userId }, { expiresAt: { lt: new Date() } }] } }),
    prisma.adminSession.create({ data: { userId, tokenHash: hashToken(token), expiresAt } }),
    prisma.adminUser.update({ where: { id: userId }, data: { lastLoginAt: new Date() } }),
  ]);
  return { token, expiresAt };
}

export async function getAdminSessionUser(token?: string) {
  if (!token) return null;
  const session = await getPrisma().adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt <= new Date() || !session.user.active) return null;
  return toSessionUser(session.user);
}

export async function destroyAdminSession(token?: string) {
  if (!token) return;
  await getPrisma().adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export function requireAdmin(user: AdminSessionUser | null, allowedRoles?: AdminRole[]) {
  if (!user) throw new ApiError(401, "Tu sesión ha expirado.");
  if (allowedRoles && !allowedRoles.includes(user.role)) throw new ApiError(403, "No tienes permisos para realizar esta acción.");
  return user;
}