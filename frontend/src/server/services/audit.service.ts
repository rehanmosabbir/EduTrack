import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";

export async function writeAuditLog(params: {
  actorUserId: string;
  entityType: string;
  entityId: string;
  action: string;
  previousValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      previousValues: params.previousValues
        ? (params.previousValues as Prisma.InputJsonValue)
        : undefined,
      newValues: params.newValues
        ? (params.newValues as Prisma.InputJsonValue)
        : undefined,
    },
  });
}

export async function listAuditLogs(params: {
  entityType?: string;
  entityId?: string;
  page: number;
  limit: number;
}) {
  const { page, limit, entityType, entityId } = params;
  const where = {
    ...(entityType ? { entityType } : {}),
    ...(entityId ? { entityId } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, role: true } } },
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}
