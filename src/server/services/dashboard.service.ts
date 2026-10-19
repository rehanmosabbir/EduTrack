import {
  AccountStatus,
  HomeworkAssignmentStatus,
  HomeworkCompletionStatus,
  PreparationStatus,
  Role,
} from "@prisma/client";
import { endOfDay, startOfDay, addDays } from "date-fns";
import { prisma } from "@/server/lib/prisma";
import { getSubjectProgress } from "@/server/services/progress.service";

export async function getTeacherDashboard() {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const soon = addDays(todayStart, 7);

  const [
    activeStudents,
    todayHomework,
    upcomingDeadlines,
    notPrepared,
    incompleteHomework,
    recentEvaluations,
    unansweredComments,
  ] = await Promise.all([
    prisma.student.count({ where: { status: AccountStatus.ACTIVE } }),
    prisma.homeworkAssignment.count({
      where: {
        assignedAt: { gte: todayStart, lte: todayEnd },
        status: HomeworkAssignmentStatus.ACTIVE,
      },
    }),
    prisma.homeworkAssignment.findMany({
      where: {
        status: HomeworkAssignmentStatus.ACTIVE,
        dueDate: { gte: todayStart, lte: soon },
      },
      include: {
        student: { select: { id: true, fullName: true } },
        subject: true,
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    prisma.lessonEvaluation.findMany({
      where: {
        evaluationDate: { gte: todayStart, lte: todayEnd },
        preparationStatus: PreparationStatus.NOT_PREPARED,
      },
      include: {
        student: { select: { id: true, fullName: true } },
        subject: true,
      },
      take: 10,
    }),
    prisma.lessonEvaluation.findMany({
      where: {
        evaluationDate: { gte: todayStart, lte: todayEnd },
        homeworkStatus: {
          in: [
            HomeworkCompletionStatus.NOT_COMPLETED,
            HomeworkCompletionStatus.PARTIALLY_COMPLETED,
          ],
        },
      },
      include: {
        student: { select: { id: true, fullName: true } },
        subject: true,
      },
      take: 10,
    }),
    prisma.lessonEvaluation.findMany({
      include: {
        student: { select: { id: true, fullName: true } },
        subject: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.guardianComment.count({
      where: {
        parentCommentId: null,
        authorRole: Role.GUARDIAN,
        replies: { none: { authorRole: Role.TEACHER } },
      },
    }),
  ]);

  return {
    activeStudents,
    todayHomework,
    upcomingDeadlines,
    notPrepared,
    incompleteHomework,
    recentEvaluations,
    unansweredComments,
  };
}

export async function getStudentDashboard(studentId: string) {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const soon = addDays(todayStart, 14);

  const [student, todayHomework, upcoming, todayEvals, recentFeedback, progress] =
    await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        include: {
          subjects: { include: { subject: true } },
        },
      }),
      prisma.homeworkAssignment.findMany({
        where: {
          studentId,
          assignedAt: { gte: todayStart, lte: todayEnd },
          status: HomeworkAssignmentStatus.ACTIVE,
        },
        include: { subject: true },
      }),
      prisma.homeworkAssignment.findMany({
        where: {
          studentId,
          status: HomeworkAssignmentStatus.ACTIVE,
          dueDate: { gte: todayStart, lte: soon },
        },
        include: { subject: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.lessonEvaluation.findMany({
        where: {
          studentId,
          evaluationDate: { gte: todayStart, lte: todayEnd },
        },
        include: { subject: true },
      }),
      prisma.lessonEvaluation.findMany({
        where: {
          studentId,
          teacherFeedback: { not: null },
        },
        include: { subject: true },
        orderBy: { evaluationDate: "desc" },
        take: 5,
      }),
      getSubjectProgress(studentId),
    ]);

  return {
    student,
    todayHomework,
    upcoming,
    todayEvals,
    recentFeedback,
    progress,
  };
}

export async function getGuardianDashboard(guardianId: string, studentId?: string) {
  const links = await prisma.studentGuardian.findMany({
    where: { guardianId },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          studentCode: true,
          className: true,
          status: true,
        },
      },
    },
  });

  const children = links.map((l) => l.student);
  const selectedId =
    studentId && children.some((c) => c.id === studentId)
      ? studentId
      : children[0]?.id;

  if (!selectedId) {
    return { children, selectedStudentId: null, dashboard: null };
  }

  const dashboard = await getStudentDashboard(selectedId);
  return { children, selectedStudentId: selectedId, dashboard };
}
