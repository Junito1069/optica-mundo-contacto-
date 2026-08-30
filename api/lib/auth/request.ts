import "server-only";
import { cookies } from "next/headers";
import { adminSessionCookieName, getAdminSessionUser, requireAdmin } from "@/lib/auth/admin";
import type { AdminRole } from "@/generated/prisma/enums";

export async function requireRequestAdmin(roles?: AdminRole[]) {
  const token = (await cookies()).get(adminSessionCookieName)?.value;
  return requireAdmin(await getAdminSessionUser(token), roles);
}