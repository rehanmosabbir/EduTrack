import { HomeworkAssignmentStatus, NotificationType } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";
import { Errors } from "@/server/utils/AppError";
import { writeAuditLog } from "@/server/services/audit.service";
import { createNotification } from "@/server/services/notification.service";

export async function listHomework(params: {
  studentId?: string;
  subjectId?: string;
  status?: HomeworkAssignmentStatus;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}) {
  const { page, limit, studentId, subjectId, status, from, to } = params;
  const where = {
    ...(studentId ? { studentId } : {}),
    ...(subjectId ? { subjectId } : {}),
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          assignedAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.homeworkAssignment.findMany({
      where,
      include: {
        student: {
          select: { id: true, fullName: true, studentCode: true, className: true },
        },
        subject: true,
      },
      orderBy: [{ assignedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.homeworkAssignment.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getHomework(id: string) {
  const hw = await prisma.homeworkAssignment.findUnique({
    where: { id },
    include: {
      student: {
        select: { id: true, fullName: true, studentCode: true, className: true },
      },
      subject: true,
    },
  });
  if (!hw) throw Errors.notFound("Homework assignment not found");
  return hw;
}

export async function createHomework(
  input: {
    studentId: string;
    subjectId: string;
    title: string;
    lessonOrChapter: string;
    instructions: string;
    assignedAt: string;
    dueDate?: string | null;
    maximumMarks?: number | null;
    attachmentUrl?: string | null;
    teacherNotes?: string | null;
  },
  teacherId: string,
) {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
    include: { user: true, guardians: { include: { guardian: true } } },
  });
  if (!student) throw Errors.notFound("Student not found");

  const subject = await prisma.subject.findUnique({
    where: { id: input.subjectId },
  });
  if (!subject) throw Errors.notFound("Subject not found");

  const hw = await prisma.homeworkAssignment.create({
    data: {
      studentId: input.studentId,
      subjectId: input.subjectId,
      title: input.title.trim(),
      lessonOrChapter: input.lessonOrChapter.trim(),
      instructions: input.instructions.trim(),
      assignedAt: new Date(input.assignedAt),
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      maximumMarks: input.maximumMarks ?? null,
      attachmentUrl: input.attachmentUrl ?? null,
      teacherNotes: input.teacherNotes ?? null,
      createdByTeacherId: teacherId,
    },
    include: {
      student: {
        select: { id: true, fullName: true, studentCode: true, className: true },
      },
      subject: true,
    },
  });

  await writeAuditLog({
    actorUserId: teacherId,
    entityType: "HomeworkAssignment",
    entityId: hw.id,
    action: "CREATED",
    newValues: {
      studentId: hw.studentId,
      subjectId: hw.subjectId,
      title: hw.title,
    },
  });

  if (student.userId) {
    await createNotification({
      userId: student.userId,
      type: NotificationType.HOMEWORK_ASSIGNED,
      title: "New homework assigned",
      body: `${subject.name}: ${hw.title}`,
      data: { homeworkId: hw.id, studentId: student.id },
    });
  }
  for (const link of student.guardians) {
    await createNotification({
      userId: link.guardian.userId,
      type: NotificationType.HOMEWORK_ASSIGNED,
      title: "New homework for your child",
      body: `${student.fullName} — ${subject.name}: ${hw.title}`,
      data: { homeworkId: hw.id, studentId: student.id },
    });
  }

  return hw;
}

export async function updateHomework(
  id: string,
  input: Record<string, unknown>,
  teacherId: string,
) {
  const prev = await getHomework(id);
  const data: Record<string, unknown> = {};
  for (const key of [
    "title",
    "lessonOrChapter",
    "instructions",
    "maximumMarks",
    "attachmentUrl",
    "teacherNotes",
    "status",
    "subjectId",
  ] as const) {
    if (input[key] !== undefined) data[key] = input[key];
  }
  if (input.assignedAt) data.assignedAt = new Date(String(input.assignedAt));
  if (input.dueDate !== undefined) {
    data.dueDate = input.dueDate ? new Date(String(input.dueDate)) : null;
  }

  const hw = await prisma.homeworkAssignment.update({
    where: { id },
    data,
    include: {
      student: {
        select: { id: true, fullName: true, studentCode: true, className: true },
      },
      subject: true,
    },
  });

  await writeAuditLog({
    actorUserId: teacherId,
    entityType: "HomeworkAssignment",
    entityId: id,
    action: "UPDATED",
    previousValues: {
      title: prev.title,
      status: prev.status,
      instructions: prev.instructions,
    },
    newValues: data,
  });

  return hw;
}
