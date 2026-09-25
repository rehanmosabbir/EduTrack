import { prisma } from "../lib/prisma.js";
import { Errors } from "../utils/AppError.js";
import { ACTIVITY_ACTIONS, logActivity } from "./activity.service.js";

function parseDateOnly(value: string) {
  const d = new Date(value);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function listStudyLogs(params: {
  studentId?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}) {
  const { studentId, from, to, page, limit } = params;
  const skip = (page - 1) * limit;
  const where = {
    ...(studentId ? { studentId } : {}),
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: parseDateOnly(from) } : {}),
            ...(to ? { lte: parseDateOnly(to) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.studyLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
    prisma.studyLog.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getStudyLog(id: string) {
  const log = await prisma.studyLog.findUnique({
    where: { id },
    include: {
      student: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!log) throw Errors.notFound("Study log not found");
  return log;
}

export async function upsertStudyLog(
  input: {
    studentId: string;
    date: string;
    studyHours: number;
    studyMinutes: number;
    description?: string;
  },
  actorId: string,
) {
  const date = parseDateOnly(input.date);
  const existing = await prisma.studyLog.findUnique({
    where: {
      studentId_date: { studentId: input.studentId, date },
    },
  });

  if (existing) {
    const updated = await prisma.studyLog.update({
      where: { id: existing.id },
      data: {
        studyHours: input.studyHours,
        studyMinutes: input.studyMinutes,
        description: input.description,
      },
      include: {
        student: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    await logActivity({
      userId: actorId,
      action: ACTIVITY_ACTIONS.STUDY_LOG_UPDATED,
      entityType: "StudyLog",
      entityId: updated.id,
    });
    return updated;
  }

  const created = await prisma.studyLog.create({
    data: {
      studentId: input.studentId,
      date,
      studyHours: input.studyHours,
      studyMinutes: input.studyMinutes,
      description: input.description,
    },
    include: {
      student: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.STUDY_LOG_CREATED,
    entityType: "StudyLog",
    entityId: created.id,
  });

  return created;
}

export async function updateStudyLog(
  id: string,
  input: {
    date?: string;
    studyHours?: number;
    studyMinutes?: number;
    description?: string;
  },
  actorId: string,
) {
  const existing = await getStudyLog(id);
  try {
    const updated = await prisma.studyLog.update({
      where: { id },
      data: {
        date: input.date ? parseDateOnly(input.date) : undefined,
        studyHours: input.studyHours,
        studyMinutes: input.studyMinutes,
        description: input.description,
      },
      include: {
        student: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    await logActivity({
      userId: actorId,
      action: ACTIVITY_ACTIONS.STUDY_LOG_UPDATED,
      entityType: "StudyLog",
      entityId: id,
    });
    return updated;
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      throw Errors.conflict("A study log already exists for this date");
    }
    void existing;
    throw e;
  }
}

export async function deleteStudyLog(id: string, actorId: string) {
  await getStudyLog(id);
  await prisma.studyLog.delete({ where: { id } });
  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.STUDY_LOG_DELETED,
    entityType: "StudyLog",
    entityId: id,
  });
  return { id };
}
