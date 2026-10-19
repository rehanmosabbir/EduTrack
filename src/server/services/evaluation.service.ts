import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";
import { Errors } from "@/server/utils/AppError";
import { writeAuditLog } from "@/server/services/audit.service";
import { createNotification } from "@/server/services/notification.service";

function validateMarks(
  marksObtained?: number | null,
  maximumMarks?: number | null,
) {
  const hasO = marksObtained !== undefined && marksObtained !== null;
  const hasM = maximumMarks !== undefined && maximumMarks !== null;
  if (!hasO && !hasM) return;
  if (hasO !== hasM) {
    throw Errors.validation(
      "Marks obtained and maximum marks must both be provided or both omitted",
    );
  }
  if (maximumMarks! <= 0) {
    throw Errors.validation("Maximum marks must be greater than zero");
  }
  if (marksObtained! < 0) {
    throw Errors.validation("Marks obtained cannot be negative");
  }
  if (marksObtained! > maximumMarks!) {
    throw Errors.validation("Marks obtained cannot exceed maximum marks");
  }
}

export async function listEvaluations(params: {
  studentId?: string;
  subjectId?: string;
  from?: string;
  to?: string;
  lesson?: string;
  preparationStatus?: string;
  homeworkStatus?: string;
  page: number;
  limit: number;
}) {
  const {
    page,
    limit,
    studentId,
    subjectId,
    from,
    to,
    lesson,
    preparationStatus,
    homeworkStatus,
  } = params;

  const where: Prisma.LessonEvaluationWhereInput = {
    ...(studentId ? { studentId } : {}),
    ...(subjectId ? { subjectId } : {}),
    ...(preparationStatus
      ? { preparationStatus: preparationStatus as never }
      : {}),
    ...(homeworkStatus ? { homeworkStatus: homeworkStatus as never } : {}),
    ...(lesson
      ? { lessonOrChapter: { contains: lesson, mode: "insensitive" } }
      : {}),
    ...(from || to
      ? {
          evaluationDate: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lessonEvaluation.findMany({
      where,
      include: {
        student: {
          select: { id: true, fullName: true, studentCode: true, className: true },
        },
        subject: true,
        homeworkAssignment: {
          select: { id: true, title: true, lessonOrChapter: true },
        },
      },
      orderBy: [{ evaluationDate: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lessonEvaluation.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getEvaluation(id: string) {
  const e = await prisma.lessonEvaluation.findUnique({
    where: { id },
    include: {
      student: {
        select: { id: true, fullName: true, studentCode: true, className: true },
      },
      subject: true,
      homeworkAssignment: true,
    },
  });
  if (!e) throw Errors.notFound("Evaluation not found");
  return e;
}

export async function createEvaluation(
  input: {
    studentId: string;
    subjectId: string;
    homeworkAssignmentId?: string | null;
    evaluationDate: string;
    lessonOrChapter: string;
    preparationStatus: string;
    homeworkStatus: string;
    marksObtained?: number | null;
    maximumMarks?: number | null;
    teacherFeedback?: string | null;
    privateTeacherNotes?: string | null;
    clientRequestId?: string;
  },
  teacherId: string,
) {
  validateMarks(input.marksObtained, input.maximumMarks);

  if (input.clientRequestId) {
    const dup = await prisma.lessonEvaluation.findUnique({
      where: { clientRequestId: input.clientRequestId },
    });
    if (dup) return getEvaluation(dup.id);
  }

  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
    include: { user: true, guardians: { include: { guardian: true } } },
  });
  if (!student) throw Errors.notFound("Student not found");

  if (input.homeworkAssignmentId) {
    const hw = await prisma.homeworkAssignment.findUnique({
      where: { id: input.homeworkAssignmentId },
    });
    if (!hw || hw.studentId !== input.studentId) {
      throw Errors.validation("Homework does not belong to this student");
    }
  }

  const evaluation = await prisma.lessonEvaluation.create({
    data: {
      studentId: input.studentId,
      subjectId: input.subjectId,
      homeworkAssignmentId: input.homeworkAssignmentId ?? null,
      evaluationDate: new Date(input.evaluationDate),
      lessonOrChapter: input.lessonOrChapter.trim(),
      preparationStatus: input.preparationStatus as never,
      homeworkStatus: input.homeworkStatus as never,
      marksObtained: input.marksObtained ?? null,
      maximumMarks: input.maximumMarks ?? null,
      teacherFeedback: input.teacherFeedback ?? null,
      privateTeacherNotes: input.privateTeacherNotes ?? null,
      evaluatedByTeacherId: teacherId,
      clientRequestId: input.clientRequestId,
    },
    include: {
      student: {
        select: { id: true, fullName: true, studentCode: true, className: true },
      },
      subject: true,
      homeworkAssignment: {
        select: { id: true, title: true, lessonOrChapter: true },
      },
    },
  });

  await writeAuditLog({
    actorUserId: teacherId,
    entityType: "LessonEvaluation",
    entityId: evaluation.id,
    action: "CREATED",
    newValues: {
      marksObtained: evaluation.marksObtained,
      maximumMarks: evaluation.maximumMarks,
      preparationStatus: evaluation.preparationStatus,
      homeworkStatus: evaluation.homeworkStatus,
    },
  });

  if (student.userId) {
    await createNotification({
      userId: student.userId,
      type: NotificationType.EVALUATION_RECORDED,
      title: "New evaluation recorded",
      body: `${evaluation.subject.name}: ${evaluation.lessonOrChapter}`,
      data: { evaluationId: evaluation.id },
    });
  }
  for (const link of student.guardians) {
    await createNotification({
      userId: link.guardian.userId,
      type: NotificationType.EVALUATION_RECORDED,
      title: "New evaluation for your child",
      body: `${student.fullName} — ${evaluation.subject.name}`,
      data: { evaluationId: evaluation.id, studentId: student.id },
    });
  }

  return evaluation;
}

export async function updateEvaluation(
  id: string,
  input: Record<string, unknown>,
  teacherId: string,
) {
  const prev = await getEvaluation(id);
  const marksObtained =
    input.marksObtained !== undefined
      ? (input.marksObtained as number | null)
      : prev.marksObtained;
  const maximumMarks =
    input.maximumMarks !== undefined
      ? (input.maximumMarks as number | null)
      : prev.maximumMarks;
  validateMarks(marksObtained, maximumMarks);

  const data: Record<string, unknown> = {};
  for (const key of [
    "subjectId",
    "homeworkAssignmentId",
    "lessonOrChapter",
    "preparationStatus",
    "homeworkStatus",
    "marksObtained",
    "maximumMarks",
    "teacherFeedback",
    "privateTeacherNotes",
  ] as const) {
    if (input[key] !== undefined) data[key] = input[key];
  }
  if (input.evaluationDate) {
    data.evaluationDate = new Date(String(input.evaluationDate));
  }

  const evaluation = await prisma.lessonEvaluation.update({
    where: { id },
    data,
    include: {
      student: {
        select: { id: true, fullName: true, studentCode: true, className: true },
      },
      subject: true,
      homeworkAssignment: {
        select: { id: true, title: true, lessonOrChapter: true },
      },
    },
  });

  await writeAuditLog({
    actorUserId: teacherId,
    entityType: "LessonEvaluation",
    entityId: id,
    action: "UPDATED",
    previousValues: {
      marksObtained: prev.marksObtained,
      maximumMarks: prev.maximumMarks,
      preparationStatus: prev.preparationStatus,
      homeworkStatus: prev.homeworkStatus,
      teacherFeedback: prev.teacherFeedback,
    },
    newValues: data,
  });

  return evaluation;
}
