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

export function getConfiguredAdminCredentials() {
  const email = (process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase() || "admin@gmail.com").toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD?.trim() || "admin";
  const name = process.env.INITIAL_ADMIN_NAME?.trim() || "Administrador";
  return { email, password, name };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toSessionUser(user: AdminSessionUser): AdminSessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function ensureDefaultAdminUser() {
  const prisma = getPrisma();
  const { email, password, name } = getConfiguredAdminCredentials();
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    const shouldUpdate = existing.role !== "ADMIN" || !existing.active || existing.name !== name || !(await bcrypt.compare(password, existing.passwordHash));

    if (shouldUpdate) {
      return prisma.adminUser.update({
        where: { id: existing.id },
        data: {
          name,
          passwordHash,
          role: "ADMIN",
          active: true,
        },
      });
    }

    return existing;
  }

  return prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });
}

export async function authenticateAdmin(email: string, password: string) {
  const prisma = getPrisma();
  const normalizedEmail = email.trim().toLowerCase();
  const { email: configuredEmail } = getConfiguredAdminCredentials();
  const candidateEmails = Array.from(new Set([normalizedEmail, configuredEmail]));

  const user = await prisma.adminUser.findFirst({
    where: { email: { in: candidateEmails }, active: true },
  });

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    return toSessionUser(user);
  }

  const defaultUser = await ensureDefaultAdminUser();
  if (defaultUser && defaultUser.active && (await bcrypt.compare(password, defaultUser.passwordHash))) {
    return toSessionUser(defaultUser);
  }

  return null;
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