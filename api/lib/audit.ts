import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db/prisma";

export async function writeAudit(userId: string, action: string, entity: string, entityId: string, metadata?: Record<string, unknown>) {
  await getPrisma().auditLog.create({ data: { userId, action, entity, entityId, metadata: metadata as Prisma.InputJsonValue | undefined } });
}