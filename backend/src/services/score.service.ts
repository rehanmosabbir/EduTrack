import { prisma } from "../lib/prisma.js";
import { Errors } from "../utils/AppError.js";
import { calculatePercentage, determineGrade } from "../utils/grading.js";
import { ACTIVITY_ACTIONS, logActivity } from "./activity.service.js";

function parseDateOnly(value: string) {
  const d = new Date(value);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getScoreStats(studentId: string, subjectId?: string) {
  const where = {
    studentId,
    ...(subjectId ? { subjectId } : {}),
  };

  const scores = await prisma.score.findMany({
    where,
    orderBy: { examDate: "asc" },
    include: { subject: true },
  });

  if (scores.length === 0) {
    return {
      overallAverage: null,
      highestScore: null,
      lowestScore: null,
      recentAverage: null,
      improvement: null,
      numberOfTests: 0,
      bySubject: [] as Array<{
        subjectId: string;
        subjectName: string;
        average: number;
        previousAverage: number | null;
        currentAverage: number;
        improvement: number | null;
        highest: number;
        lowest: number;
        count: number;
      }>,
      progression: [] as Array<{ date: string; percentage: number; examName: string; subject: string }>,
    };
  }

  const percentages = scores.map((s) => s.percentage);
  const overallAverage =
    Math.round(
      (percentages.reduce((a, b) => a + b, 0) / percentages.length) * 100,
    ) / 100;
  const highestScore = Math.max(...percentages);
  const lowestScore = Math.min(...percentages);
  const recent = percentages.slice(-5);
  const recentAverage =
    Math.round((recent.reduce((a, b) => a + b, 0) / recent.length) * 100) / 100;

  const half = Math.floor(percentages.length / 2) || 1;
  const firstHalf = percentages.slice(0, half);
  const secondHalf = percentages.slice(-half);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const improvement =
    percentages.length >= 2
      ? Math.round((secondAvg - firstAvg) * 100) / 100
      : null;

  const bySubjectMap = new Map<string, typeof scores>();
  for (const s of scores) {
    const arr = bySubjectMap.get(s.subjectId) ?? [];
    arr.push(s);
    bySubjectMap.set(s.subjectId, arr);
  }

  const bySubject = [...bySubjectMap.entries()].map(([sid, list]) => {
    const pcts = list.map((x) => x.percentage);
    const avg = Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100) / 100;
    const mid = Math.floor(pcts.length / 2) || 1;
    const prev = pcts.slice(0, mid);
    const curr = pcts.slice(-mid);
    const previousAverage =
      prev.length > 0
        ? Math.round((prev.reduce((a, b) => a + b, 0) / prev.length) * 100) / 100
        : null;
    const currentAverage =
      Math.round((curr.reduce((a, b) => a + b, 0) / curr.length) * 100) / 100;
    return {
      subjectId: sid,
      subjectName: list[0].subject.name,
      average: avg,
      previousAverage,
      currentAverage,
      improvement:
        previousAverage !== null
          ? Math.round((currentAverage - previousAverage) * 100) / 100
          : null,
      highest: Math.max(...pcts),
      lowest: Math.min(...pcts),
      count: list.length,
    };
  });

  return {
    overallAverage,
    highestScore,
    lowestScore,
    recentAverage,
    improvement,
    numberOfTests: scores.length,
    bySubject,
    progression: scores.map((s) => ({
      date: s.examDate.toISOString().slice(0, 10),
      percentage: s.percentage,
      examName: s.examName,
      subject: s.subject.name,
      subjectId: s.subjectId,
    })),
  };
}

export async function listScores(params: {
  studentId?: string;
  subjectId?: string;
  from?: string;
  to?: string;
  examName?: string;
  page: number;
  limit: number;
}) {
  const { studentId, subjectId, from, to, examName, page, limit } = params;
  const skip = (page - 1) * limit;
  const where = {
    ...(studentId ? { studentId } : {}),
    ...(subjectId ? { subjectId } : {}),
    ...(examName
      ? { examName: { contains: examName, mode: "insensitive" as const } }
      : {}),
    ...(from || to
      ? {
          examDate: {
            ...(from ? { gte: parseDateOnly(from) } : {}),
            ...(to ? { lte: parseDateOnly(to) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.score.findMany({
      where,
      skip,
      take: limit,
      orderBy: { examDate: "desc" },
      include: {
        subject: true,
        student: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    }),
    prisma.score.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getScore(id: string) {
  const score = await prisma.score.findUnique({
    where: { id },
    include: {
      subject: true,
      student: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!score) throw Errors.notFound("Score not found");
  return score;
}

export async function createScore(
  input: {
    studentId: string;
    subjectId: string;
    examName: string;
    examDate: string;
    obtainedMarks: number;
    totalMarks: number;
    remarks?: string;
  },
  actorId: string,
) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: input.studentId },
  });
  if (!student) throw Errors.notFound("Student not found");
  const subject = await prisma.subject.findUnique({
    where: { id: input.subjectId },
  });
  if (!subject) throw Errors.notFound("Subject not found");

  const percentage = calculatePercentage(input.obtainedMarks, input.totalMarks);
  const grade = determineGrade(percentage);

  const score = await prisma.score.create({
    data: {
      studentId: input.studentId,
      subjectId: input.subjectId,
      examName: input.examName,
      examDate: parseDateOnly(input.examDate),
      obtainedMarks: input.obtainedMarks,
      totalMarks: input.totalMarks,
      percentage,
      grade,
      remarks: input.remarks,
    },
    include: {
      subject: true,
      student: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.SCORE_CREATED,
    entityType: "Score",
    entityId: score.id,
    metadata: { studentId: input.studentId, percentage, grade },
  });

  return score;
}

export async function updateScore(
  id: string,
  input: {
    studentId?: string;
    subjectId?: string;
    examName?: string;
    examDate?: string;
    obtainedMarks?: number;
    totalMarks?: number;
    remarks?: string;
  },
  actorId: string,
) {
  const existing = await getScore(id);
  const obtained = input.obtainedMarks ?? existing.obtainedMarks;
  const total = input.totalMarks ?? existing.totalMarks;
  if (obtained > total) {
    throw Errors.validation("Obtained marks cannot exceed total marks");
  }
  const percentage = calculatePercentage(obtained, total);
  const grade = determineGrade(percentage);

  const score = await prisma.score.update({
    where: { id },
    data: {
      studentId: input.studentId,
      subjectId: input.subjectId,
      examName: input.examName,
      examDate: input.examDate ? parseDateOnly(input.examDate) : undefined,
      obtainedMarks: input.obtainedMarks,
      totalMarks: input.totalMarks,
      percentage,
      grade,
      remarks: input.remarks,
    },
    include: {
      subject: true,
      student: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.SCORE_UPDATED,
    entityType: "Score",
    entityId: id,
  });

  return score;
}

export async function deleteScore(id: string, actorId: string) {
  await getScore(id);
  await prisma.score.delete({ where: { id } });
  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.SCORE_DELETED,
    entityType: "Score",
    entityId: id,
  });
  return { id };
}
