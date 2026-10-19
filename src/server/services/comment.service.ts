import { NotificationType, Role } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";
import { Errors } from "@/server/utils/AppError";
import type { AuthUser } from "@/server/auth/types";
import { ROLES } from "@/server/utils/constants";
import { createNotification } from "@/server/services/notification.service";

export async function listComments(params: {
  studentId: string;
  page: number;
  limit: number;
}) {
  const { studentId, page, limit } = params;
  const where = { studentId, parentCommentId: null as string | null };

  const [items, total] = await Promise.all([
    prisma.guardianComment.findMany({
      where,
      include: {
        guardian: {
          include: { user: { select: { id: true, name: true } } },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            guardian: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
        relatedEvaluation: {
          select: { id: true, lessonOrChapter: true, evaluationDate: true },
        },
        relatedHomework: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.guardianComment.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function listUnansweredComments(page = 1, limit = 20) {
  const threads = await prisma.guardianComment.findMany({
    where: {
      parentCommentId: null,
      authorRole: Role.GUARDIAN,
      replies: { none: { authorRole: Role.TEACHER } },
    },
    include: {
      guardian: {
        include: { user: { select: { id: true, name: true } } },
      },
      student: {
        select: { id: true, fullName: true, studentCode: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  const total = await prisma.guardianComment.count({
    where: {
      parentCommentId: null,
      authorRole: Role.GUARDIAN,
      replies: { none: { authorRole: Role.TEACHER } },
    },
  });
  return {
    items: threads,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function createComment(
  user: AuthUser,
  input: {
    studentId: string;
    message: string;
    relatedEvaluationId?: string | null;
    relatedHomeworkAssignmentId?: string | null;
    parentCommentId?: string | null;
  },
) {
  const message = input.message.trim();
  if (!message) throw Errors.validation("Message is required");

  if (user.role === ROLES.STUDENT) {
    throw Errors.forbidden("Students cannot access guardian conversations");
  }

  let guardianId: string | null = null;
  const authorRole = user.role as Role;

  if (user.role === ROLES.GUARDIAN) {
    if (!user.guardianId) throw Errors.forbidden();
    guardianId = user.guardianId;
    if (input.parentCommentId) {
      throw Errors.forbidden("Guardians cannot reply in place of the teacher");
    }
  }

  if (input.parentCommentId) {
    if (user.role !== ROLES.TEACHER) {
      throw Errors.forbidden("Only teachers can reply");
    }
    const parent = await prisma.guardianComment.findUnique({
      where: { id: input.parentCommentId },
    });
    if (!parent || parent.studentId !== input.studentId) {
      throw Errors.validation("Invalid parent comment");
    }
  }

  const comment = await prisma.guardianComment.create({
    data: {
      studentId: input.studentId,
      guardianId,
      authorUserId: user.id,
      authorRole,
      message,
      relatedEvaluationId: input.relatedEvaluationId ?? null,
      relatedHomeworkAssignmentId: input.relatedHomeworkAssignmentId ?? null,
      parentCommentId: input.parentCommentId ?? null,
    },
    include: {
      guardian: {
        include: { user: { select: { id: true, name: true } } },
      },
      student: { select: { id: true, fullName: true } },
    },
  });

  // Notify the other party
  if (user.role === ROLES.GUARDIAN) {
    const teachers = await prisma.user.findMany({
      where: { role: Role.TEACHER, status: "ACTIVE" },
      select: { id: true },
    });
    for (const t of teachers) {
      await createNotification({
        userId: t.id,
        type: NotificationType.GUARDIAN_COMMENT,
        title: "New guardian comment",
        body: `${comment.student.fullName}: ${message.slice(0, 80)}`,
        data: { commentId: comment.id, studentId: input.studentId },
      });
    }
  } else if (user.role === ROLES.TEACHER && input.parentCommentId) {
    const parent = await prisma.guardianComment.findUnique({
      where: { id: input.parentCommentId },
      include: { guardian: true },
    });
    if (parent?.guardian) {
      await createNotification({
        userId: parent.guardian.userId,
        type: NotificationType.TEACHER_REPLY,
        title: "Teacher replied to your comment",
        body: message.slice(0, 80),
        data: { commentId: comment.id, studentId: input.studentId },
      });
    }
  }

  return comment;
}
