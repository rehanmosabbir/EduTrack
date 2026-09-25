import { prisma } from "../lib/prisma.js";
import { totalStudyMinutes } from "../utils/grading.js";
import { getScoreStats } from "./score.service.js";

function parseDateOnly(value?: string) {
  if (!value) return undefined;
  const d = new Date(value);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getReportData(filters: {
  studentId?: string;
  subjectId?: string;
  from?: string;
  to?: string;
  examName?: string;
}) {
  const from = parseDateOnly(filters.from);
  const to = parseDateOnly(filters.to);

  const scoreWhere = {
    ...(filters.studentId ? { studentId: filters.studentId } : {}),
    ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
    ...(filters.examName
      ? { examName: { contains: filters.examName, mode: "insensitive" as const } }
      : {}),
    ...(from || to
      ? {
          examDate: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  };

  const studyWhere = {
    ...(filters.studentId ? { studentId: filters.studentId } : {}),
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  };

  const [scores, studyLogs] = await Promise.all([
    prisma.score.findMany({
      where: scoreWhere,
      orderBy: { examDate: "asc" },
      include: {
        subject: true,
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    }),
    prisma.studyLog.findMany({
      where: studyWhere,
      orderBy: { date: "asc" },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    }),
  ]);

  const scoreStats = filters.studentId
    ? await getScoreStats(filters.studentId, filters.subjectId)
    : null;

  const totalStudyMins = studyLogs.reduce(
    (a, l) => a + totalStudyMinutes(l.studyHours, l.studyMinutes),
    0,
  );

  return {
    scores,
    studyLogs,
    scoreStats,
    summary: {
      totalScores: scores.length,
      avgScore:
        scores.length > 0
          ? Math.round(
              (scores.reduce((a, s) => a + s.percentage, 0) / scores.length) *
                100,
            ) / 100
          : null,
      totalStudyMinutes: totalStudyMins,
      totalStudyFormatted: `${Math.floor(totalStudyMins / 60)}h ${totalStudyMins % 60}m`,
      studyLogCount: studyLogs.length,
    },
  };
}

export function scoresToCsv(
  scores: Array<{
    examDate: Date;
    examName: string;
    obtainedMarks: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    subject: { name: string; code: string };
    student: { user: { name: string; email: string }; studentId: string };
    remarks: string | null;
  }>,
): string {
  const header = [
    "Student Name",
    "Student ID",
    "Email",
    "Subject",
    "Subject Code",
    "Exam",
    "Exam Date",
    "Obtained",
    "Total",
    "Percentage",
    "Grade",
    "Remarks",
  ].join(",");

  const rows = scores.map((s) =>
    [
      csvEscape(s.student.user.name),
      csvEscape(s.student.studentId),
      csvEscape(s.student.user.email),
      csvEscape(s.subject.name),
      csvEscape(s.subject.code),
      csvEscape(s.examName),
      s.examDate.toISOString().slice(0, 10),
      s.obtainedMarks,
      s.totalMarks,
      s.percentage,
      s.grade,
      csvEscape(s.remarks ?? ""),
    ].join(","),
  );

  return [header, ...rows].join("\n");
}

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
