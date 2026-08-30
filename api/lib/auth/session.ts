import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { getPrisma } from "@/lib/db/prisma";
import { customerSessionCookieName } from "@/lib/auth/customer";

export const sessionCookieName = customerSessionCookieName;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getCurrentUser() {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return null;

  const session = await getPrisma().customerSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (session && session.expiresAt > new Date() && session.user.active) {
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      createdAt: session.user.createdAt.toISOString(),
    };
  }

  return null;
}
