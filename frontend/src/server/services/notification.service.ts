import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: params.userId },
  });
  if (prefs && !prefs.inAppEnabled) return null;

  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data
        ? (params.data as Prisma.InputJsonValue)
        : undefined,
    },
  });
}

export async function listNotifications(userId: string, page = 1, limit = 20) {
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function markNotificationRead(userId: string, id: string) {
  const n = await prisma.notification.findFirst({ where: { id, userId } });
  if (!n) return null;
  return prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
}
