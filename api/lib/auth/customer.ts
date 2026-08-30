import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/db/prisma";

export const customerSessionCookieName = "mundo_contacto_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toPublicUser(user: { id: string; name: string; email: string; createdAt: Date }) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt.toISOString() };
}

export async function registerCustomer(input: { name: string; email: string; password: string }) {
  const prisma = getPrisma();
  const email = input.email.toLowerCase();
  const existing = await prisma.customerUser.findUnique({ where: { email } });
  if (existing) return null;
  const user = await prisma.customerUser.create({ data: { name: input.name, email, passwordHash: await bcrypt.hash(input.password, 12) } });
  return toPublicUser(user);
}

export async function authenticateCustomer(email: string, password: string) {
  const user = await getPrisma().customerUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return toPublicUser(user);
}

export async function createCustomerSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  const prisma = getPrisma();
  await prisma.$transaction([
    prisma.customerSession.deleteMany({ where: { OR: [{ userId }, { expiresAt: { lt: new Date() } }] } }),
    prisma.customerSession.create({ data: { userId, tokenHash: hashToken(token), expiresAt } }),
    prisma.customerUser.update({ where: { id: userId }, data: { lastLoginAt: new Date() } }),
  ]);
  return { token, expiresAt };
}

export async function destroyCustomerSession(token?: string) {
  if (!token) return;
  await getPrisma().customerSession.deleteMany({ where: { tokenHash: hashToken(token) } });
}